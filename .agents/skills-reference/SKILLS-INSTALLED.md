# 🎓 Installed Skills Reference

Skills yang sudah diinstall untuk project **ITB Insight Demo Web** — digunakan oleh GitHub Copilot & AI agents untuk memberikan guidance yang lebih akurat sesuai tech stack project ini.

---

## 1. **Next.js + TypeScript + Tailwind + Supabase**

📦 **Package:** `mindrally/skills@nextjs-typescript-tailwindcss-supabase`  
📊 **Installs:** 659  
📍 **Location:** `.\.agents\skills\nextjs-typescript-tailwindcss-supabase`

**What it does:**
- Guidance untuk Next.js 14 App Router setup
- TypeScript best practices
- Tailwind CSS + shadcn/ui integration
- Supabase auth & database patterns
- Server/client component separation

**Use when:**
- Setup Next.js structure
- Creating auth flows
- Building database queries
- Styling components dengan Tailwind

---

## 2. **Supabase Dedicated Skill**

📦 **Package:** `supabase/agent-skills@supabase`  
📊 **Installs:** 44.6K (MOST POPULAR)  
📍 **Location:** `.\.agents\skills\supabase`

**What it does:**
- Supabase auth patterns (OAuth, Magic Link, JWT)
- RLS (Row Level Security) policies
- Database queries & real-time subscriptions
- Storage operations (upload/download)
- Edge functions & webhooks

**Use when:**
- Setting up authentication
- Creating database schemas
- Managing file uploads
- Configuring security policies

---

## 3. **UI Design System Skill**

📦 **Package:** `samhvw8/dot-claude@ui-design-system`  
📊 **Installs:** 2.8K  
📍 **Location:** `.\.agents\skills\ui-design-system`

**What it does:**
- High-quality UI component patterns
- Design system principles
- Accessible component guidelines
- Animation & interaction patterns
- Tailwind CSS advanced usage
- shadcn/ui customization

**Use when:**
- Building landing pages
- Creating form components
- Designing dashboards
- Need "polished" UI/UX guidance

---

## How Skills Work

Skills are loaded into GitHub Copilot context automatically when:
1. You're working in this project (`demo-web`)
2. You ask questions related to the tech stack
3. AI agents make recommendations

**Example:**
- Ask: "bagaimana cara setup auth dengan Google OAuth?" → Copilot akan refer ke **Supabase Skill**
- Ask: "bikin landing page yang cantik untuk hero section" → refer ke **UI Design Skill**
- Ask: "gimana caranya organize folder structure?" → refer ke **Next.js Skill**

---

## Check for Updates

```bash
# Check if new versions available
npx skills check

# Update installed skills
npx skills update

# List all installed skills
npx skills list
```

---

## Browse More Skills

Visit https://skills.sh/ untuk explore skills lain yang mungkin berguna:
- **Testing skills** (Jest, Playwright)
- **DevOps skills** (Docker, CI/CD)
- **Database skills** (PostgreSQL, migrations)
- **API skills** (REST, GraphQL)

---

## Notes

- Skills dipilih berdasarkan **popularity & relevance** ke tech stack project
- Semua skills passing **security review**
- Dapat di-remove atau di-update kapan saja
- Skills NOT mengganti official documentation, hanya complement

---

*Last updated: May 1, 2026*
