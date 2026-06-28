# Phase 0: Setup & Scaffolding 🚀

**Timeline:** Hari 1  
**Goal:** Repo jalan di lokal, semua service terkoneksi  
**Target Deliverable:** `localhost:3000` tampil halaman kosong, semua env vars valid

---

## Checklist

- [ ] Create Next.js app with TypeScript & Tailwind
- [ ] Install dependencies (Framer Motion, Supabase, Sanity, Mapbox, Resend, QR Code)
- [ ] Setup shadcn/ui
- [ ] Create Supabase project & database schema
- [ ] Create Sanity project & initial schemas
- [ ] Setup API keys (Resend, Mapbox)
- [ ] Create `.env.local` with all keys
- [ ] Push to GitHub
- [ ] Connect to Vercel & deploy

---

## Step 1: Create Next.js App

```bash
cd d:\Coding\demo-web
npx create-next-app@latest . --typescript --tailwind --app --eslint --git
```

**Options to select:**
- ✅ TypeScript
- ✅ Tailwind CSS  
- ✅ App Router
- ✅ ESLint
- ✅ Git

---

## Step 2: Install Core Dependencies

```bash
npm install framer-motion \
  @supabase/supabase-js \
  @supabase/ssr \
  next-sanity \
  @sanity/client \
  mapbox-gl \
  resend \
  qrcode.react \
  @types/mapbox-gl \
  --save
```

---

## Step 3: Setup shadcn/ui

```bash
npx shadcn-ui@latest init
```

**Config:**
- Style: New York
- Base color: Slate
- CSS variables: Yes

---

## Step 4: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy `Project URL` & `Anon Key`
4. **Run SQL Schema** (bagian 6 di instruction.md utama)
5. Setup **Authentication → Providers → Google OAuth**
6. Add Redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://xxxx.vercel.app/auth/callback` (update nanti)

---

## Step 5: Create Sanity Project

```bash
npm create sanity@latest
```

**Config:**
- Select "Empty project"
- Dataset: `production`
- Select folder: `sanity`

```bash
# Setup schemas
# Create these files in /sanity/schemas/
```

---

## Step 6: Setup Environment Variables

Create `.env.local` di root project:

```bash
# SUPABASE
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# SANITY CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=xxxxxxxx
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=sk...

# MAPBOX
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...

# RESEND
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@itbinsight.id

# APP CONFIG
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_EVENT_DATE=2026-11-15T08:00:00+07:00
```

**Create `.env.example`** (commit this, NOT `.env.local`):

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=
NEXT_PUBLIC_MAPBOX_TOKEN=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_EVENT_DATE=
```

---

## Step 7: Verify Setup

```bash
# Test dev server
npm run dev

# Open http://localhost:3000
# Should see default Next.js page
```

**Check console for errors!** Jika ada error, verify env vars.

---

## Step 8: Push to GitHub

```bash
git add .
git commit -m "feat: initial setup - nextjs, supabase, sanity, tailwind"
git push origin main
```

---

## Step 9: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. **New site from Git** → Connect GitHub
3. Select repo `demo-web`
4. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `.next`
5. **Environment variables** (copy dari `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SANITY_PROJECT_ID`
   - `NEXT_PUBLIC_SANITY_DATASET`
   - `SANITY_API_TOKEN`
   - `NEXT_PUBLIC_MAPBOX_TOKEN`
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
6. **Deploy!**

---

## ⚠️ Important Notes

- **JANGAN commit `.env.local`** — add to `.gitignore`
- Vercel free tier cocok untuk demo
- Verify semua env vars di Vercel sebelum deploy
- Test auth flow: Google OAuth redirect harus ke `https://xxxx.vercel.app/auth/callback`

---

## Next Phase
Ketika Phase 0 selesai → Lanjut ke **Phase 1: Auth + Landing** (01-AUTH-LANDING.md)
