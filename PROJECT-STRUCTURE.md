# 📊 ITB Insight Demo — Project Structure Diagram

## 🏗️ Complete Project Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                   ITB INSIGHT DEMO WEB (May 2026)                │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  DOCUMENTATION LAYER (✅ COMPLETED)                              │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ README.md (Master Guide) ← START HERE                      │  │
│  │ PROGRESS.md (Tracking)                                     │  │
│  │ SETUP-SUMMARY.md (What's Done)                             │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  PHASE GUIDES (✅ COMPLETED)                                     │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Phase 0: 00-SETUP.md ────── Setup & Scaffolding            │  │
│  │ Phase 1: 01-AUTH-LANDING.md Auth + Landing Page           │  │
│  │ Phase 2: 02-COMPETITION.md ─ Competition Registration ⭐  │  │
│  │ Phase 3: 03-MAP-MEDIA.md ─── Map + Media Gallery          │  │
│  │ Phase 4: 04-CONTENT-POLISH.md Content + Polish            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  AI SKILLS (✅ INSTALLED)                                        │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ nextjs-typescript-tailwindcss-supabase (659 installs)      │  │
│  │ supabase (44.6K installs ⭐ MOST POPULAR)                  │  │
│  │ ui-design-system (2.8K installs)                           │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  TO CREATE IN PHASES                                             │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ /app ──────────────── Next.js routes & pages               │  │
│  │ /components ──────── React UI components                   │  │
│  │ /lib ──────────────── Utilities & SDK clients              │  │
│  │ /public ───────────── Static assets                        │  │
│  │ /sanity ──────────── CMS Studio & schemas                  │  │
│  │ package.json ──────── Dependencies                         │  │
│  │ .env.local ────────── Environment variables               │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Execution Flow (Phases)

```
PHASE 0: SETUP
├─ Create Next.js app
├─ Install dependencies  
├─ Setup Supabase + Sanity + Mapbox + Resend
├─ Configure .env.local
└─ Deploy to Netlify
   └─ ✅ localhost:3000 works

        ↓↓↓

PHASE 1: AUTH + LANDING
├─ Landing page + particle animation
├─ Countdown timer
├─ Login/Register forms
├─ Google OAuth flow
└─ Dashboard layout
   └─ ✅ User can login → dashboard

        ↓↓↓

PHASE 2: COMPETITION REGISTRATION ⭐ MAIN
├─ Sanity CMS integration
├─ Competition listing page
├─ Registration form
├─ File upload
├─ Supabase data storage
├─ Email confirmation (Resend)
└─ Dashboard status display
   └─ ✅ End-to-end flow working

        ↓↓↓

PHASE 3: MAP + MEDIA
├─ Mapbox map integration
├─ Venue pins (3 locations)
├─ Media gallery
├─ Lazy loading
├─ Framer Motion animations
└─ Scroll effects
   └─ ✅ "Wow factor" achieved

        ↓↓↓

PHASE 4: POLISH + LAUNCH
├─ News page from Sanity
├─ About page + Sponsors
├─ QR tickets
├─ Responsive design test
├─ Lighthouse audit (> 80)
├─ OG meta tags
└─ Final deployment
   └─ ✅ DEMO READY FOR PRESENTATION
```

---

## 🔗 Tech Integration Points

```
┌─────────────────────────────────────────────────────────────────┐
│                     NEXT.JS 14 APP (Frontend)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Pages & Routes (App Router)                                    │
│  ├─ / (landing) ──→ Particle animation, countdown               │
│  ├─ /login, /register ──→ Auth flows                           │
│  ├─ /competitions ──→ Sanity fetch                             │
│  ├─ /dashboard ──→ Protected route, status display             │
│  ├─ /map ──→ Mapbox integration                                │
│  ├─ /gallery ──→ Media display                                 │
│  └─ /api/* ──→ Route handlers (backend)                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
         ↓              ↓              ↓              ↓
    ┌────────┐    ┌─────────┐  ┌──────────┐  ┌──────────┐
    │SUPABASE │    │ SANITY  │  │ MAPBOX   │  │ RESEND   │
    │ ├─Auth  │    │ ├─Schema│  │├─API Key │  │├─Email   │
    │ ├─DB    │    │ ├─Content ├─├─Tokens │  │├─Templates
    │ ├─Storage    │ └─CMS UI │  │└─Styling │  │└─Webhooks│
    │ └─RLS   │    └─────────┘  └──────────┘  └──────────┘
    └────────┘
     (Database)  (CMS)          (Maps)         (Email)
```

---

## 📁 File Structure at Each Phase

### After Phase 0
```
demo-web/
├── app/
│   ├── layout.tsx (root)
│   ├── page.tsx (landing - minimal)
│   └── globals.css
├── components/
│   └── ui/ (shadcn components)
├── lib/
│   └── supabase/
│       ├── client.ts
│       └── server.ts
├── package.json
├── .env.local
└── middleware.ts
```

### After Phase 1
```
demo-web/
├── app/
│   ├── layout.tsx
│   ├── page.tsx (✅ landing with particles)
│   ├── (public)/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── callback/
│   └── dashboard/
│       └── layout.tsx (with auth middleware)
├── components/
│   ├── landing/
│   │   ├── HeroParticles.tsx
│   │   ├── CountdownTimer.tsx
│   │   └── ProgramHighlights.tsx
│   ├── auth/
│   │   └── LoginForm.tsx
│   └── ui/ (shadcn)
└── lib/
    └── supabase/ + middleware helpers
```

### After Phase 2
```
demo-web/
├── app/
│   ├── (public)/
│   │   └── competitions/
│   │       ├── page.tsx (✅ list)
│   │       └── [slug]/page.tsx (✅ detail)
│   ├── (auth)/ (as before)
│   ├── dashboard/
│   │   ├── page.tsx (✅ with registrations)
│   │   ├── register-competition/page.tsx (✅ form)
│   │   └── my-tickets/page.tsx
│   └── api/
│       ├── register/route.ts (✅ main API)
│       └── send-email/route.ts
├── components/
│   ├── dashboard/
│   │   └── CompetitionRegisterForm.tsx (✅)
│   └── ...
├── lib/
│   ├── sanity/
│   │   ├── client.ts (✅)
│   │   └── queries.ts (✅)
│   └── ...
└── sanity/
    ├── sanity.config.ts (✅)
    └── schemas/
        └── competition.ts (✅)
```

### After Phase 3
```
demo-web/
├── app/
│   ├── (public)/
│   │   ├── competitions/ (as before)
│   │   ├── map/page.tsx (✅)
│   │   └── gallery/page.tsx (✅)
│   ├── dashboard/
│   │   ├── my-tickets/page.tsx (✅)
│   │   └── ...
│   └── ...
├── components/
│   ├── map/
│   │   └── VenueMap.tsx (✅ Mapbox)
│   └── ...
└── ...
```

### After Phase 4 (COMPLETE)
```
demo-web/
├── app/
│   ├── (public)/
│   │   ├── about/page.tsx (✅)
│   │   ├── news/page.tsx (✅)
│   │   ├── sponsors/page.tsx (✅)
│   │   └── ... (complete)
│   ├── dashboard/ (complete)
│   ├── api/ (complete)
│   └── ...
├── public/
│   ├── og-image.png (✅)
│   └── ...
├── sanity/
│   └── schemas/
│       ├── competition.ts
│       ├── article.ts (✅)
│       └── author.ts (✅)
├── .env.local (all vars filled)
├── .env.example (template)
├── middleware.ts (complete)
└── netlify.toml (config)
```

---

## 🔄 Data Flow

```
USER → NEXT.JS APP → SUPABASE → EMAIL (RESEND)
  ↓        ↓              ↓
  Login    OAuth          Auth
  ↓        Callback       ↓
  Register                DB:profiles
  ↓        ↓              ↓
  Fill     Form           registrations
  Form     Validation     table
  ↓        ↓              ↓
  Submit   API Route      Insert
           (/api/register) ↓
                          Trigger
                          Email
                          ↓
           ← Resend Email (Confirmation)
           ↓
           User inbox
           ↓
           User sees status in dashboard
           ↓
           COMPLETE FLOW!
```

---

## ✅ Deliverables by Phase

| Phase | Main Deliverable | User Can |
|-------|------------------|----------|
| 0 | Localhost:3000 working | Visit app locally |
| 1 | Login + Dashboard | Authenticate + view profile |
| 2 | Registration flow ⭐ | Register for competition |
| 3 | Map + Gallery | Explore venue + media |
| 4 | Full app live | Use everything! |

---

## 🎯 Success Metrics

```
Phase 0 Success:
├─ npm run dev → runs without error
├─ localhost:3000 → loads page
└─ .env vars → all valid

Phase 1 Success:
├─ Google OAuth → redirects to /dashboard
├─ User profile → displays
└─ Logout → works

Phase 2 Success:
├─ Competition list → displays from Sanity
├─ Registration form → submits to Supabase
├─ Email → arrives in inbox
└─ Dashboard status → shows "pending"

Phase 3 Success:
├─ Map → loads with pins
├─ Gallery → loads with lazy loading
└─ Animations → run smooth

Phase 4 Success:
├─ Lighthouse → score > 80
├─ Mobile (375px) → responsive OK
├─ No console errors → clean
└─ Ready for presentation → YES! 🎉
```

---

## 🚀 Next Steps in Order

1. **Read:** [README.md](README.md) ← Overview
2. **Read:** [docs/00-SETUP.md](docs/00-SETUP.md) ← Phase 0 details
3. **Execute:** Phase 0 steps (create app, install deps)
4. **Deploy:** To Netlify
5. **Read:** [docs/01-AUTH-LANDING.md](docs/01-AUTH-LANDING.md)
6. **Build:** Phase 1 features
7. ... **Continue** through Phases 2, 3, 4

---

*Diagram created: May 1, 2026*  
*Status: Ready for execution*
