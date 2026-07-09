schema_version: 1

# Sprints

Source of truth: `docs/MVP-SCOPE.md`, `docs/BACKLOG.md`, current code.

Audience: project owner and contributors tracking active delivery work.

## Current Sprint

Goal: stabilize docs structure and keep launch-critical follow-up work visible.

| Workstream | Status | Definition Of Done |
| --- | --- | --- |
| Docs skeleton | Done | Index, backlog, sprint, release, decision, QA, and runbook surfaces exist. |
| Problematic docs extraction | Done | Active items moved into `BACKLOG.md`, `DECISIONS.md`, `QA-CHECKLIST.md`, and runbooks. Old planning docs are removed from the active docs tree. |
| Launch configuration checks | Pending | OAuth branding, Midtrans callback, admin role seeding, RLS smoke tests, and favicon/app icon behavior are verified in target environment. |

## Next Candidate Sprint

| Priority | Item | Notes |
| --- | --- | --- |
| High | Production launch hardening | Run `QA-CHECKLIST.md`, seed admin roles, verify env vars, smoke test Supabase and Midtrans sandbox. |
| High | Content finalization | Decide hardcoded vs Sanity operational source and add final competition content. |
| Medium | Security hardening | Rate limiting, audit logs, backup/monitoring, retention policy. |
| Medium | Future PRD scope selection | Decide whether RSVP, booth tracking, feedback, or event program pages return before launch. |

## Completed Implementation Phases Snapshot

The previous long implementation checklist is no longer an active source of truth. Completed MVP areas include competition data shape, Supabase MVP schema, shared API helpers, visitor ticket ensure, individual registration, team create/join/submit, admin review/export/check-in, mock payment, Midtrans sandbox/webhook, navigation cleanup, admin polish, and protected logout behavior.
