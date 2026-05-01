# 📋 ITB Insight Demo Web — Project Progress

**Project:** ITB Insight — Tech Exhibition Website Demo  
**Timeline:** May 1 - November 2026  
**Current Status:** 🟡 Phase 0 Initiated  
**Last Updated:** May 1, 2026

---

## 📊 Overall Progress

```
Phase 0 (Setup)           [████████░░░░░░░░░░] 40% ⏳ IN PROGRESS
Phase 1 (Auth+Landing)    [░░░░░░░░░░░░░░░░░░] 0%
Phase 2 (Competition)     [░░░░░░░░░░░░░░░░░░] 0%
Phase 3 (Map+Media)       [░░░░░░░░░░░░░░░░░░] 0%
Phase 4 (Polish)          [░░░░░░░░░░░░░░░░░░] 0%
```

---

## ✅ Completed Tasks

### Phase 0: Setup & Scaffolding

#### Skills Discovery & Installation
- ✅ Found 3 relevant skills from open ecosystem:
  - `mindrally/skills@nextjs-typescript-tailwindcss-supabase` (659 installs)
  - `supabase/agent-skills@supabase` (44.6K installs - POPULAR)
  - `samhvw8/dot-claude@ui-design-system` (2.8K installs)
- ✅ Installed all 3 skills locally to `.\.agents\skills\`
- ✅ Created skill reference documentation

#### Documentation Structure
- ✅ Created `/docs` folder untuk mini instructions
- ✅ Created `/docs/00-SETUP.md` (Phase 0 instructions)
- ✅ Created `/docs/01-AUTH-LANDING.md` (Phase 1 preview)
- ✅ Created `.agents\skills-reference\SKILLS-INSTALLED.md` (skill documentation)
- ✅ Created `PROGRESS.md` (tracking file - this file)

---

## 🚧 In Progress

### Phase 0: Setup & Scaffolding (Continuing)

- ⏳ Create Next.js app with TypeScript & Tailwind
- ⏳ Install core dependencies
- ⏳ Setup shadcn/ui
- ⏳ Create Supabase project & database schema
- ⏳ Create Sanity project & initial schemas
- ⏳ Setup API keys (Resend, Mapbox)
- ⏳ Create `.env.local` with all environment variables
- ⏳ Push to GitHub
- ⏳ Deploy to Netlify

**Expected Completion:** May 1-2, 2026

---

## ⏸️ Not Started

### Phase 1: Core Feature — Auth + Landing (May 2-3)
- [ ] Landing page dengan hero section & particle animation
- [ ] Countdown timer ke event date
- [ ] Stats counter
- [ ] Program highlights cards
- [ ] Login form (Google OAuth + Magic Link)
- [ ] Auth middleware & callback handler
- [ ] Dashboard layout dengan auth check

### Phase 2: Competition Registration (May 4-5)
- [ ] Sanity schema untuk competition
- [ ] Halaman `/competitions` & `/competitions/[slug]`
- [ ] Registration form di dashboard
- [ ] API route `/api/register`
- [ ] Email konfirmasi via Resend
- [ ] Dashboard status display

### Phase 3: Map + Media (May 6-7)
- [ ] Mapbox integration untuk venue ITB
- [ ] Map pins (Aula Timur, Labtek, Sasana Budaya Ganesha)
- [ ] Galeri media dengan lazy loading
- [ ] Framer Motion page transitions

### Phase 4: Content + Polish (May 8)
- [ ] News halaman dari Sanity
- [ ] About halaman + Sponsors
- [ ] QR Ticket di dashboard
- [ ] Responsive design check
- [ ] OG image untuk social sharing
- [ ] Lighthouse audit (target > 80)

---

## 📂 Folder Structure Created

```
demo-web/
├── docs/
│   ├── 00-SETUP.md                 ← Setup phase instructions
│   ├── 01-AUTH-LANDING.md          ← Auth phase instructions
│   ├── 02-COMPETITION.md           ← (TODO) Competition phase
│   ├── 03-MAP-MEDIA.md             ← (TODO) Map phase
│   └── 04-CONTENT-POLISH.md        ← (TODO) Polish phase
│
├── .agents/
│   └── skills-reference/
│       └── SKILLS-INSTALLED.md     ← Skills documentation
│
├── instruction.md                  ← Original master instruction (PROVIDED)
└── PROGRESS.md                     ← This file
```

---

## 🛠️ Tech Stack Confirmed

| Category | Technology | Status |
|----------|------------|--------|
| Framework | Next.js 14 App Router | ✅ Plan |
| Language | TypeScript | ✅ Plan |
| Styling | Tailwind CSS v3 + shadcn/ui | ✅ Plan |
| Animation | Framer Motion | 📦 To Install |
| Database | Supabase PostgreSQL | ✅ Plan |
| Auth | Supabase Auth (Google OAuth) | ✅ Plan |
| CMS | Sanity.io | ✅ Plan |
| Maps | Mapbox GL JS | 📦 To Install |
| Email | Resend | 📦 To Install |
| Hosting | Netlify | ✅ Plan |
| CI/CD | GitHub Actions | ✅ Plan |

---

## 📋 Next Steps (Immediate)

1. **Execute Phase 0 step-by-step** sesuai `/docs/00-SETUP.md`
2. Create Next.js app di folder ini
3. Install semua dependencies
4. Setup Supabase & Sanity projects
5. Configure environment variables
6. Deploy ke Netlify
7. Test di `localhost:3000`

**Target Completion Date:** May 2, 2026

---

## 🎯 Success Criteria (Definition of Done)

Demo dianggap selesai dan siap presentasi ketika:

- [ ] URL live dapat dibuka tanpa error (Netlify)
- [ ] Google OAuth berhasil login & redirect ke dashboard
- [ ] Form registrasi lomba berhasil submit → data muncul di Supabase
- [ ] Email konfirmasi masuk ke inbox setelah registrasi
- [ ] Deskripsi minimal 1 lomba muncul dari Sanity CMS
- [ ] Peta Mapbox menampilkan area kampus ITB dengan minimal 1 pin
- [ ] Particle animation berjalan di hero landing
- [ ] Countdown menampilkan waktu mundur
- [ ] Halaman responsive di mobile (375px)
- [ ] Tidak ada console error di browser
- [ ] Lighthouse score > 80

---

## 📞 Resources & Links

- **Master Instruction:** `/instruction.md` (reference lengkap)
- **Skill Details:** `/.agents/skills-reference/SKILLS-INSTALLED.md`
- **Phase 0 Guide:** `/docs/00-SETUP.md`
- **Phase 1 Guide:** `/docs/01-AUTH-LANDING.md`

---

## 🔄 Update History

| Date | Update | Status |
|------|--------|--------|
| May 1, 2026 | Initial setup - Skills discovery & documentation | ✅ Complete |
| (TBD) | Phase 0 completion - Deployed to Netlify | ⏳ Pending |
| (TBD) | Phase 1 completion - Auth + Landing | ⏳ Pending |
| (TBD) | Phase 2 completion - Competition Registration | ⏳ Pending |
| (TBD) | Phase 3 completion - Map + Media | ⏳ Pending |
| (TBD) | Phase 4 completion - Polish & Deploy | ⏳ Pending |

---

*Dokumen ini di-update setiap kali ada progress signifikan. Last sync: May 1, 2026*
