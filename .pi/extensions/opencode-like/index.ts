import { spawn } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { copyToClipboard, type ExtensionAPI, type ExtensionContext } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";

/**
 * OpenCode-like workflow extension for Pi.
 *
 * Features:
 * - Primary modes: build, plan, execute, orchestrate
 * - /mode command + /agents command
 * - Plan mode: read-only tools, blocks edit/write, confirms unsafe bash
 * - Execute mode: restores full tools and tracks [DONE:n] plan progress
 * - Orchestrate mode: exposes subagent tool and encourages delegation
 * - Subagents: markdown agents in ~/.pi/agent/agents and .pi/agents
 */

type Mode = "build" | "plan" | "execute" | "orchestrate";
type AgentScope = "user" | "project" | "both";

interface PlanStep {
  n: number;
  text: string;
  done: boolean;
}

interface AgentDef {
  name: string;
  description: string;
  tools?: string[];
  model?: string;
  prompt: string;
  source: "user" | "project";
  file: string;
}

const BUILD_TOOLS = ["read", "bash", "edit", "write", "grep", "find", "ls"];
const PLAN_TOOLS = ["read", "bash", "grep", "find", "ls"];
const ORCHESTRATE_TOOLS = [...BUILD_TOOLS, "subagent"];
const STATE_TYPE = "opencode-like-state";
const CHILD_TYPE = "opencode-like-child-session";
const MAX_PARALLEL = 6;
const MAX_OUTPUT = 50 * 1024;

type PermissionAction = "allow" | "ask" | "deny";
type PermissionRule = PermissionAction | Record<string, PermissionAction>;
interface OcConfig {
  permission?: Record<string, PermissionRule>;
  modes?: Partial<Record<Mode, { tools?: string[]; permission?: Record<string, PermissionRule> }>>;
  agents?: Record<string, { permission?: Record<string, PermissionRule>; tools?: string[]; model?: string; description?: string; prompt?: string; mode?: "primary" | "subagent" | "all"; hidden?: boolean }>;
}

function readConfig(cwd: string): OcConfig {
  const file = path.join(cwd, ".pi", "opencode-like.json");
  if (!fs.existsSync(file)) return {};
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return {}; }
}

function wildcard(pattern: string, text: string): boolean {
  const esc = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".");
  return new RegExp(`^${esc}$`, "i").test(text);
}

function permissionInput(tool: string, input: any): string {
  if (tool === "bash") return String(input?.command ?? "");
  if (tool === "edit" || tool === "write" || tool === "read") return String(input?.path ?? input?.file_path ?? "");
  if (tool === "grep") return String(input?.pattern ?? "");
  if (tool === "find" || tool === "ls") return String(input?.path ?? input?.pattern ?? "");
  if (tool === "subagent") return String(input?.agent ?? input?.tasks?.map((t: any) => t.agent).join(",") ?? input?.chain?.map((t: any) => t.agent).join(",") ?? "");
  return JSON.stringify(input ?? {});
}

function resolvePermission(config: OcConfig, mode: Mode, tool: string, input: any): PermissionAction | undefined {
  const modePerm = config.modes?.[mode]?.permission ?? {};
  const merged = { ...(config.permission ?? {}), ...modePerm };
  const keys = [tool, tool === "write" ? "edit" : undefined, tool === "edit" ? "edit" : undefined, "*"].filter(Boolean) as string[];
  const text = permissionInput(tool, input);
  for (const key of keys) {
    const rule = merged[key];
    if (!rule) continue;
    if (typeof rule === "string") return rule;
    let action: PermissionAction | undefined;
    for (const [pattern, value] of Object.entries(rule)) if (wildcard(pattern, text)) action = value;
    if (action) return action;
  }
}

function getHomeAgentDir() {
  return path.join(os.homedir(), ".pi", "agent", "agents");
}

function parseFrontmatter(src: string): { fm: Record<string, string>; body: string } {
  if (!src.startsWith("---")) return { fm: {}, body: src };
  const end = src.indexOf("\n---", 3);
  if (end < 0) return { fm: {}, body: src };
  const raw = src.slice(3, end).trim();
  const fm: Record<string, string> = {};
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (m) fm[m[1]] = m[2].replace(/^['"]|['"]$/g, "").trim();
  }
  return { fm, body: src.slice(end + 5).trim() };
}

function loadAgents(cwd: string, scope: AgentScope): AgentDef[] {
  const dirs: Array<{ dir: string; source: "user" | "project" }> = [];
  if (scope === "user" || scope === "both") dirs.push({ dir: getHomeAgentDir(), source: "user" });
  if (scope === "project" || scope === "both") dirs.push({ dir: path.join(cwd, ".pi", "agents"), source: "project" });

  const map = new Map<string, AgentDef>();
  for (const { dir, source } of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!ent.isFile() || !ent.name.endsWith(".md")) continue;
      const file = path.join(dir, ent.name);
      const { fm, body } = parseFrontmatter(fs.readFileSync(file, "utf8"));
      const name = fm.name || path.basename(ent.name, ".md");
      const config = readConfig(cwd).agents?.[name];
      if (config?.mode === "primary" || config?.hidden) continue;
      const description = config?.description || fm.description || `${name} subagent`;
      const rawTools = config?.tools ?? fm.tools?.split(",") ?? [];
      let tools = rawTools.map((s: string) => s.trim()).filter(Boolean);
      if (config?.permission?.edit === "deny") tools = tools.filter((t) => t !== "edit" && t !== "write");
      if (config?.permission?.bash === "deny") tools = tools.filter((t) => t !== "bash");
      map.set(name, { name, description, tools: tools.length ? tools : undefined, model: config?.model || fm.model, prompt: config?.prompt || body, source, file });
    }
  }
  return [...map.values()];
}

function isSafePlanBash(command: string): boolean {
  const c = command.trim();
  return /^(pwd|ls|dir|find|rg|grep|cat|type|head|tail|wc|git\s+(status|diff|log|show|grep|ls-files|branch)|npm\s+(test|run\s+(test|lint|typecheck)|ls)|pnpm\s+(test|lint)|yarn\s+(test|lint))\b/.test(c);
}

function extractPlanSteps(text: string): PlanStep[] {
  const idx = text.search(/^\s*Plan\s*:/im);
  const slice = idx >= 0 ? text.slice(idx) : text;
  const steps: PlanStep[] = [];
  for (const line of slice.split(/\r?\n/)) {
    const m = line.match(/^\s*(\d+)\.\s+(.+)$/);
    if (m) steps.push({ n: Number(m[1]), text: m[2].trim(), done: false });
  }
  return steps;
}

function markDone(text: string, steps: PlanStep[]) {
  let changed = false;
  for (const m of text.matchAll(/\[DONE:(\d+)\]/gi)) {
    const n = Number(m[1]);
    const step = steps.find((s) => s.n === n);
    if (step && !step.done) {
      step.done = true;
      changed = true;
    }
  }
  return changed;
}

function assistantText(messages: any[]): string {
  const last = [...messages].reverse().find((m) => m?.role === "assistant");
  if (!last?.content) return "";
  return last.content.filter((p: any) => p.type === "text").map((p: any) => p.text).join("\n");
}

function truncate(s: string) {
  return Buffer.byteLength(s, "utf8") <= MAX_OUTPUT ? s : s.slice(0, MAX_OUTPUT) + "\n\n[truncated]";
}

function messageText(message: any): string {
  const content = message?.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) return content.filter((p: any) => p.type === "text").map((p: any) => p.text).join("\n");
  return "";
}

function entryLabel(entry: any): string {
  if (entry.type === "custom_message") return `custom: ${String(entry.content).slice(0, 80)}`;
  if (entry.type !== "message") return `${entry.type}: ${entry.id.slice(0, 8)}`;
  const role = entry.message?.role ?? "message";
  const text = messageText(entry.message).replace(/\s+/g, " ").trim().slice(0, 100);
  return `${role}: ${text || entry.id.slice(0, 8)}`;
}

async function runPiAgent(cwd: string, agent: AgentDef, task: string, signal?: AbortSignal): Promise<{ output: string; sessionPath?: string }> {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "pi-oc-agent-"));
  const promptFile = path.join(tmp, `${agent.name}.md`);
  fs.writeFileSync(promptFile, agent.prompt, "utf8");
  const sessionDir = path.join(cwd, ".pi", "child-sessions");
  fs.mkdirSync(sessionDir, { recursive: true });

  const args = ["--mode", "json", "-p", "--session-dir", sessionDir, "--name", `@${agent.name}: ${task.slice(0, 60)}`, "--append-system-prompt", promptFile];
  if (agent.model) args.push("--model", agent.model);
  if (agent.tools?.length) args.push("--tools", agent.tools.join(","));
  args.push(`Task: ${task}`);

  return await new Promise<{ output: string; sessionPath?: string }>((resolve, reject) => {
    const proc = spawn("pi", args, { cwd, stdio: ["ignore", "pipe", "pipe"], shell: false });
    let out = "";
    let err = "";
    let buf = "";
    let sessionPath: string | undefined;

    const onAbort = () => {
      proc.kill("SIGTERM");
      setTimeout(() => proc.kill("SIGKILL"), 3000);
    };
    if (signal) signal.aborted ? onAbort() : signal.addEventListener("abort", onAbort, { once: true });

    proc.stdout.on("data", (d) => {
      buf += d.toString();
      const lines = buf.split("\n");
      buf = lines.pop() || "";
      for (const line of lines) {
        try {
          const ev = JSON.parse(line);
          if ((ev.type === "session_start" || ev.type === "session") && ev.sessionFile) sessionPath = ev.sessionFile;
          if (ev.type === "message_end" && ev.message?.role === "assistant") {
            const txt = ev.message.content?.filter((p: any) => p.type === "text").map((p: any) => p.text).join("\n");
            if (txt) out = txt;
          }
        } catch {}
      }
    });
    proc.stderr.on("data", (d) => (err += d.toString()));
    proc.on("error", reject);
    proc.on("close", (code) => {
      try { fs.rmSync(tmp, { recursive: true, force: true }); } catch {}
      if (!sessionPath) {
        try {
          const files = fs.readdirSync(sessionDir).map((f) => path.join(sessionDir, f)).filter((f) => f.endsWith(".jsonl"));
          sessionPath = files.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
        } catch {}
      }
      if (code !== 0) reject(new Error(err || `subagent exited ${code}`));
      else resolve({ output: out || "(no output)", sessionPath });
    });
  });
}

export default function opencodeLike(pi: ExtensionAPI) {
  let mode: Mode = "build";
  let steps: PlanStep[] = [];
  let toolsBeforePlan: string[] | undefined;

  const persist = () => pi.appendEntry(STATE_TYPE, { mode, steps, toolsBeforePlan });

  const applyTools = () => {
    const config = readConfig(process.cwd());
    const configuredTools = config.modes?.[mode]?.tools;
    if (configuredTools?.length) {
      pi.setActiveTools(configuredTools);
      return;
    }
    if (mode === "plan") {
      if (!toolsBeforePlan) toolsBeforePlan = pi.getActiveTools();
      pi.setActiveTools(PLAN_TOOLS);
    } else if (mode === "orchestrate") {
      pi.setActiveTools(ORCHESTRATE_TOOLS);
    } else {
      pi.setActiveTools(toolsBeforePlan ?? BUILD_TOOLS);
      toolsBeforePlan = undefined;
    }
  };

  const renderStatus = (ctx: ExtensionContext) => {
    const label = mode === "build" ? undefined : mode === "plan" ? "⏸ plan" : mode === "execute" ? "▶ exec" : "◎ orch";
    ctx.ui.setStatus("oc-mode", label ? ctx.ui.theme.fg(mode === "plan" ? "warning" : "accent", label) : undefined);
    if ((mode === "execute" || mode === "plan") && steps.length) {
      ctx.ui.setWidget("oc-plan", steps.map((s) => `${s.done ? ctx.ui.theme.fg("success", "☑") : ctx.ui.theme.fg("muted", "☐")} ${s.n}. ${s.done ? ctx.ui.theme.strikethrough(s.text) : s.text}`));
    } else ctx.ui.setWidget("oc-plan", undefined);
  };

  const setMode = (next: Mode, ctx: ExtensionContext) => {
    mode = next;
    if (mode === "build" || mode === "orchestrate") steps = [];
    applyTools();
    renderStatus(ctx);
    persist();
    ctx.ui.notify(`Mode: ${mode}`, "info");
  };

  pi.registerCommand("mode", {
    description: "OpenCode-like modes: build | plan | execute | orchestrate",
    handler: async (args, ctx) => {
      const next = args.trim() as Mode;
      if (["build", "plan", "execute", "orchestrate"].includes(next)) return setMode(next, ctx);
      const choice = await ctx.ui.select("Select mode", ["build", "plan", "execute", "orchestrate"]);
      if (choice) setMode(choice as Mode, ctx);
    },
  });

  pi.registerCommand("agents", {
    description: "List OpenCode-like subagents",
    handler: async (_args, ctx) => {
      const agents = loadAgents(ctx.cwd, "both");
      ctx.ui.notify(agents.map((a) => `@${a.name} [${a.source}] - ${a.description}`).join("\n") || "No agents found", "info");
    },
  });

  pi.registerCommand("children", {
    description: "Browse persistent child subagent sessions",
    handler: async (_args, ctx) => {
      const children = ctx.sessionManager.getEntries().filter((e: any) => e.type === "custom" && e.customType === CHILD_TYPE) as any[];
      if (!children.length) return ctx.ui.notify("No child sessions yet", "info");
      const choice = await ctx.ui.select("Child sessions", children.map((e) => `${e.data.agent}: ${e.data.task.slice(0, 80)} | ${e.data.sessionPath}`));
      if (!choice) return;
      const item = children.find((e) => choice.endsWith(e.data.sessionPath));
      if (item?.data.sessionPath) await (ctx as any).switchSession(item.data.sessionPath);
    },
  });

  async function openMessageActions(ctx: any) {
      const entries = ctx.sessionManager.getBranch().filter((e: any) => e.type === "message" || e.type === "custom_message");
      if (!entries.length) return ctx.ui.notify("No messages", "info");
      const choice = await ctx.ui.select("Message", entries.map((e: any, i: number) => `${i + 1}. ${entryLabel(e)}`));
      if (!choice) return;
      const index = Number(choice.split(".")[0]) - 1;
      const entry = entries[index] as any;
      if (!entry) return;
      const action = await ctx.ui.select("Action", ["revert", "copy", "fork"]);
      if (action === "copy") {
        const text = entry.type === "custom_message" ? String(entry.content) : messageText(entry.message);
        await copyToClipboard(text);
        ctx.ui.notify("Copied message", "info");
      } else if (action === "fork") {
        await ctx.fork(entry.id, { position: "at" });
      } else if (action === "revert") {
        const target = entry.parentId ?? entry.id;
        await ctx.navigateTree(target, { summarize: false, label: `revert-before-${entry.id.slice(0, 6)}` });
        ctx.ui.notify("Reverted by navigating session tree. Continue from here to create a new branch.", "info");
      }
  }

  pi.registerCommand("msg", {
    description: "Pick a message and choose: revert, copy, fork",
    handler: async (_args, ctx) => openMessageActions(ctx),
  });

  pi.registerShortcut("ctrl+shift+m", {
    description: "Open message actions (revert/copy/fork)",
    handler: async (ctx) => openMessageActions(ctx),
  });

  pi.registerTool({
    name: "subagent",
    label: "Subagent",
    description: "Delegate work to specialized OpenCode-like subagents. Use single {agent, task}, parallel {tasks}, or chain {chain with {previous}}.",
    parameters: Type.Object({
      agent: Type.Optional(Type.String()),
      task: Type.Optional(Type.String()),
      tasks: Type.Optional(Type.Array(Type.Object({ agent: Type.String(), task: Type.String() }))),
      chain: Type.Optional(Type.Array(Type.Object({ agent: Type.String(), task: Type.String() }))),
      agentScope: Type.Optional(Type.Union([Type.Literal("user"), Type.Literal("project"), Type.Literal("both")], { default: "both" })),
    }),
    async execute(_id, params, signal, onUpdate, ctx) {
      const agents = loadAgents(ctx.cwd, (params.agentScope as AgentScope) ?? "both");
      const findAgent = (name: string) => agents.find((a) => a.name === name);
      const run = async (name: string, task: string) => {
        const agent = findAgent(name);
        if (!agent) throw new Error(`Unknown agent ${name}. Available: ${agents.map((a) => a.name).join(", ")}`);
        onUpdate?.({ content: [{ type: "text", text: `Running @${name}...` }] });
        const { output, sessionPath } = await runPiAgent(ctx.cwd, agent, task, signal);
        if (sessionPath) pi.appendEntry(CHILD_TYPE, { agent: name, task, sessionPath, timestamp: new Date().toISOString() });
        return `### @${name}\n\n${truncate(output)}${sessionPath ? `\n\n[child session: ${sessionPath}]` : ""}`;
      };

      if (params.tasks?.length) {
        if (params.tasks.length > MAX_PARALLEL) throw new Error(`Max ${MAX_PARALLEL} parallel tasks`);
        const outputs = await Promise.all(params.tasks.map((t) => run(t.agent, t.task)));
        return { content: [{ type: "text", text: outputs.join("\n\n---\n\n") }], details: { mode: "parallel" } };
      }
      if (params.chain?.length) {
        let previous = "";
        const outputs: string[] = [];
        for (const item of params.chain) {
          previous = await run(item.agent, item.task.replace(/\{previous\}/g, previous));
          outputs.push(previous);
        }
        return { content: [{ type: "text", text: outputs.join("\n\n---\n\n") }], details: { mode: "chain" } };
      }
      if (params.agent && params.task) {
        const output = await run(params.agent, params.task);
        return { content: [{ type: "text", text: output }], details: { mode: "single" } };
      }
      return { content: [{ type: "text", text: `Available agents: ${agents.map((a) => `${a.name}: ${a.description}`).join("; ")}` }] };
    },
  });

  pi.on("input", async (event) => {
    const m = event.text.match(/^@(\w[\w-]*)\s+([\s\S]+)/);
    if (!m) return { action: "continue" };
    return { action: "transform", text: `Use the subagent tool with agent="${m[1]}" and task=${JSON.stringify(m[2])}.` };
  });

  pi.on("tool_call", async (event, ctx) => {
    const config = readConfig(ctx.cwd);
    const action = resolvePermission(config, mode, event.toolName, event.input);
    if (action === "deny") return { block: true, reason: `Denied by .pi/opencode-like.json: ${event.toolName}` };
    if (action === "ask") {
      const ok = ctx.hasUI ? await ctx.ui.confirm("Permission", `Allow ${event.toolName}?\n\n${permissionInput(event.toolName, event.input)}`) : false;
      if (!ok) return { block: true, reason: `Permission denied: ${event.toolName}` };
    }

    if (mode !== "plan") return;
    if (event.toolName === "edit" || event.toolName === "write") return { block: true, reason: "Plan mode is read-only." };
    if (event.toolName === "bash") {
      const command = String((event.input as any).command ?? "");
      if (isSafePlanBash(command)) return;
      const ok = ctx.hasUI ? await ctx.ui.confirm("Plan mode bash", `Allow command?\n\n${command}`) : false;
      if (!ok) return { block: true, reason: "Plan mode: bash command denied." };
    }
  });

  pi.on("before_agent_start", async () => {
    if (mode === "plan") return { message: { customType: "oc-mode", display: false, content: `[PLAN MODE]\nExplore and propose a numbered plan only. Do not modify files. Put steps under:\n\nPlan:\n1. ...\n2. ...` } };
    if (mode === "execute" && steps.length) return { message: { customType: "oc-mode", display: false, content: `[EXECUTION MODE]\nExecute the remaining plan steps in order. Mark completed steps with [DONE:n].\n\n${steps.filter((s) => !s.done).map((s) => `${s.n}. ${s.text}`).join("\n")}` } };
    if (mode === "orchestrate") return { message: { customType: "oc-mode", display: false, content: `[ORCHESTRATION MODE]\nBreak complex work into subagent tasks. Prefer @explore/@scout for reconnaissance, @reviewer for review, and then implement directly when ready.` } };
  });

  pi.on("turn_end", async (event, ctx) => {
    if (mode !== "execute" || !steps.length) return;
    const text = assistantText([event.message]);
    if (markDone(text, steps)) {
      renderStatus(ctx);
      persist();
    }
  });

  pi.on("agent_end", async (event, ctx) => {
    if (mode === "plan") {
      const found = extractPlanSteps(assistantText(event.messages));
      if (found.length) {
        steps = found;
        renderStatus(ctx);
        persist();
        if (ctx.hasUI) {
          const choice = await ctx.ui.select("Plan created", ["execute", "refine", "stay in plan"]);
          if (choice === "execute") {
            setMode("execute", ctx);
            pi.sendUserMessage("Execute the plan. Start with step 1 and mark completed steps using [DONE:n].", { deliverAs: "followUp" });
          } else if (choice === "refine") {
            const text = await ctx.ui.editor("Refine instruction", "");
            if (text?.trim()) pi.sendUserMessage(text.trim(), { deliverAs: "followUp" });
          }
        }
      }
    }
    if (mode === "execute" && steps.length && steps.every((s) => s.done)) {
      ctx.ui.notify("Plan complete", "info");
      setMode("build", ctx);
    }
  });

  pi.on("session_start", async (_event, ctx) => {
    ctx.ui.addAutocompleteProvider((current) => ({
      triggerCharacters: ["@"],
      async getSuggestions(lines, line, col, options) {
        const before = (lines[line] ?? "").slice(0, col);
        const match = before.match(/(?:^|\s)@(\w[\w-]*)$/);
        if (!match) return current.getSuggestions(lines, line, col, options);
        const agents = loadAgents(ctx.cwd, "both");
        const needle = match[1].toLowerCase();
        return {
          prefix: `@${match[1]}`,
          items: agents
            .filter((a) => a.name.toLowerCase().includes(needle))
            .map((a) => ({ value: `@${a.name}`, label: `@${a.name}`, description: `${a.source}: ${a.description}` })),
        };
      },
      applyCompletion(lines, line, col, item, prefix) { return current.applyCompletion(lines, line, col, item, prefix); },
      shouldTriggerFileCompletion(lines, line, col) { return current.shouldTriggerFileCompletion?.(lines, line, col) ?? true; },
    }));

    const last = [...ctx.sessionManager.getEntries()].reverse().find((e: any) => e.type === "custom" && e.customType === STATE_TYPE) as any;
    if (last?.data) {
      mode = last.data.mode ?? mode;
      steps = last.data.steps ?? steps;
      toolsBeforePlan = last.data.toolsBeforePlan;
    }
    applyTools();
    renderStatus(ctx);
  });
}
