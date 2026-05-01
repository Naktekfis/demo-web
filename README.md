# 📚 ITB Insight Demo Web — Project Guide

Dokumentasi komprehensif untuk membangun quick demo ITB Insight yang memanfaatkan seluruh tech stack produksi. Proyek ini dirancang untuk dipresentasikan ke stakeholder dengan menampilkan seluruh flow dari auth hingga registrasi dan email confirmation.

---

## 🎯 Quick Navigation

### Master Documents

1. **[instruction.md](./instruction.md)** ← Master document (PROVIDED)
   - Konteks proyek lengkap
   - Arsitektur sistem
   - Tech stack detailed
   - Database schema
   - Kode starter

2. **[PROGRESS.md](./PROGRESS.md)** ← Tracking progress
   - Status keseluruhan project
   - Checklist completed
   - Next steps

### Phase-by-Phase Guides

| Phase | File | Timeline | Focus |
|-------|------|----------|-------|
| **0** | [docs/00-SETUP.md](./docs/00-SETUP.md) | Hari 1 | Setup repo, services, env vars |
| **1** | [docs/01-AUTH-LANDING.md](./docs/01-AUTH-LANDING.md) | Hari 2-3 | Auth + Landing page with animations |
| **2** | [docs/02-COMPETITION.md](./docs/02-COMPETITION.md) | Hari 4-5 | Competition registration (main feature) |
| **3** | [docs/03-MAP-MEDIA.md](./docs/03-MAP-MEDIA.md) | Hari 6-7 | Map + Media gallery |
| **4** | [docs/04-CONTENT-POLISH.md](./docs/04-CONTENT-POLISH.md) | Hari 8 | Content + Polish + Lighthouse |

### Reference

- **[.agents/skills-reference/SKILLS-INSTALLED.md](.agents/skills-reference/SKILLS-INSTALLED.md)** ← Installed skills info

---

## 📊 Project Structure

```
demo-web/
├── instruction.md                          ← Master guide (PROVIDED)
├── PROGRESS.md                             ← Project tracking
├── README.md                               ← This file
│
├── docs/                                   ← Phase-by-phase guides
│   ├── 00-SETUP.md                        ✅ Phase 0: Scaffolding
│   ├── 01-AUTH-LANDING.md                 ✅ Phase 1: Auth + Landing
│   ├── 02-COMPETITION.md                  ✅ Phase 2: Registration (MAIN)
│   ├── 03-MAP-MEDIA.md                    ✅ Phase 3: Map + Media
│   └── 04-CONTENT-POLISH.md               ✅ Phase 4: Polish
│
├── .agents/
│   └── skills-reference/
│       └── SKILLS-INSTALLED.md            ← Installed AI skills info
│
├── app/                                   ← Next.js App Router (TO CREATE)
├── components/                            ← React Components (TO CREATE)
├── lib/                                   ← Utilities (TO CREATE)
├── public/                                ← Static files (TO CREATE)
└── sanity/                                ← Sanity Studio (TO CREATE)
```

---

## 🛠️ Tech Stack

| Layer | Technology | Status |
|-------|-----------|--------|
| **Framework** | Next.js 14 (App Router) | 📋 To setup |
| **Language** | TypeScript | 📋 To setup |
| **Styling** | Tailwind CSS v3 + shadcn/ui | 📋 To setup |
| **Animation** | Framer Motion | 📋 To install |
| **Database** | Supabase PostgreSQL | ✅ Planned |
| **Auth** | Supabase Auth (Google OAuth) | ✅ Planned |
| **CMS** | Sanity.io | ✅ Planned |
| **Maps** | Mapbox GL JS | ✅ Planned |
| **Email** | Resend | ✅ Planned |
| **Hosting** | Vercel (FREE) | ✅ Planned |
| **CI/CD** | GitHub Actions | ✅ Planned |

---

## ✨ Key Features to Showcase

1. **🔐 Unified Authentication**
   - Google OAuth via Supabase
   - Magic Link (email OTP) fallback
   - Automatic profile creation

2. **🎓 Competition Registration** (MAIN FEATURE)
   - Browse competitions from Sanity CMS
   - Register team with multiple members
   - File upload to Supabase Storage
   - Automatic email confirmation via Resend
   - Track registration status on dashboard

3. **🎨 Hero Animation**
   - Physics-based particle system
   - Countdown timer to event date
   - Framer Motion page transitions

4. **🗺️ Interactive Map**
   - Mapbox with venue pins
   - Filter by event type
   - Information popups

5. **📊 Performance**
   - Lighthouse score target: > 80
   - Responsive design (mobile-first)
   - Optimized images & lazy loading

---

## 🚀 Getting Started

### Option 1: Follow Phase-by-Phase (Recommended)

```bash
# 1. Read Phase 0 guide first
cat docs/00-SETUP.md

# 2. Execute each step sequentially
# (Create app, install deps, configure services)

# 3. After Phase 0 complete, move to Phase 1
cat docs/01-AUTH-LANDING.md

# ... continue through Phases 2, 3, 4
```

### Option 2: Quick Reference

```bash
# Just need to remember the 5 phases
Phase 0 (Setup)         → 00-SETUP.md
Phase 1 (Auth+Landing)  → 01-AUTH-LANDING.md
Phase 2 (Registration)  → 02-COMPETITION.md
Phase 3 (Map+Media)     → 03-MAP-MEDIA.md
Phase 4 (Polish)        → 04-CONTENT-POLISH.md
```

---

## 📋 Installed AI Skills

3 powerful skills dari open ecosystem sudah diinstall untuk membantu Copilot memberikan guidance yang akurat:

1. **Next.js + TypeScript + Tailwind + Supabase** (659 installs)
   - `.agents/skills/nextjs-typescript-tailwindcss-supabase`

2. **Supabase Dedicated** (44.6K installs - POPULAR)
   - `.agents/skills/supabase`

3. **UI Design System** (2.8K installs)
   - `.agents/skills/ui-design-system`

Details: [.agents/skills-reference/SKILLS-INSTALLED.md](.agents/skills-reference/SKILLS-INSTALLED.md)

---

## ✅ Success Criteria

Demo dianggap selesai ketika:

- [ ] URL live di Vercel, accessible tanpa error
- [ ] Google OAuth login → redirect ke dashboard
- [ ] Competition registration end-to-end working
- [ ] Email confirmation masuk ke inbox
- [ ] Sanity CMS terkoneksi (content dapat diupdate non-dev)
- [ ] Mapbox menampilkan venue pins
- [ ] Particle animation berjalan smooth
- [ ] Responsive di mobile (375px)
- [ ] Lighthouse score > 80
- [ ] No console errors
- [ ] Ready for stakeholder presentation

---

## 🔗 Important Links

### External Services to Setup

- **Supabase:** https://supabase.com
- **Sanity CMS:** https://sanity.io
- **Mapbox:** https://mapbox.com
- **Resend:** https://resend.com
- **Vercel:** https://vercel.com
- **GitHub:** https://github.com

### Documentation

- **Supabase SSR Guide:** https://supabase.com/docs/guides/auth/server-side/nextjs
- **Sanity Next.js Guide:** https://www.sanity.io/guides/nextjs-app-router-live-preview
- **Mapbox GL JS Docs:** https://docs.mapbox.com/mapbox-gl-js/
- **Resend Next.js:** https://resend.com/docs/send-with-nextjs
- **shadcn/ui:** https://ui.shadcn.com
- **Framer Motion:** https://www.framer.com/motion/

---

## 🎯 Timeline

```
May 1        Phase 0 Start         (Skills discovery ✅ + Docs creation ✅)
May 1-2      Phase 0 Complete      (Setup repo, services, deploy)
May 2-3      Phase 1 Complete      (Auth + Landing)
May 4-5      Phase 2 Complete      (Competition Registration - MAIN)
May 6-7      Phase 3 Complete      (Map + Media)
May 8        Phase 4 Complete      (Polish + Launch)
May 8+       Ready for Presentation
```

---

## 💡 Tips for Success

1. **Follow guides in order** — Don't skip phases
2. **Test as you go** — `npm run dev` frequently
3. **Check console for errors** — Fix immediately
4. **Use the .env.example template** — Don't commit `.env.local`
5. **Deploy early to Vercel** — Test live URL, fix auth redirect
6. **Use installed skills** — Ask Copilot for guidance, it will reference the skills

---

## 🔍 FAQ

**Q: Boleh skip Phase 0?**  
A: Tidak, Phase 0 setup semua infrastructure. Tanpa ini tidak ada yang jalan.

**Q: Sanity CMS ribet?**  
A: Tidak, Phase 2 sudah ada langkah-langkah detailed. Ikuti saja.

**Q: Mapbox token mahal?**  
A: Free tier cukup untuk demo ini. Jangan expose di production.

**Q: Berapa lama total?**  
A: 8 hari kalau follow phases, 2-3 hari kalau full-time sprint.

**Q: Bisa deploy sebelum selesai semua phase?**  
A: Iya, deploy sejak Phase 1 selesai ke Vercel. Update terus-menerus.

---

## 📞 Support

- **Master Guide:** [instruction.md](./instruction.md)
- **Progress Tracking:** [PROGRESS.md](./PROGRESS.md)
- **Skills Info:** [.agents/skills-reference/SKILLS-INSTALLED.md](.agents/skills-reference/SKILLS-INSTALLED.md)
- **GitHub Copilot:** Installed skills akan help dengan guidance

---

## 🎉 Let's Build!

**Start dengan:** `cat docs/00-SETUP.md`

---

*Dokumen ini dibuat: May 1, 2026*  
*Last updated: May 1, 2026*
