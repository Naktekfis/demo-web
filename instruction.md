# ITB Insight — Quick Demo Instruction Sheet
> **Untuk:** GitHub Copilot / AI Coding Agent  
> **Dibuat oleh:** WebDev Tech Lead  
> **Tujuan:** Panduan lengkap membangun quick demo yang memanfaatkan seluruh stack produksi

---

## 0. Konteks Proyek

| Item | Detail |
|------|--------|
| **Nama Event** | ITB Insight — Tech Exhibition ITB |
| **Skala** | 2nd Largest Event ITB (setelah Pasar Seni) |
| **Penyelenggara** | HMFT-ITB (Himpunan Mahasiswa Fisika Teknik) |
| **Timeline Aktif** | Agustus – November 2026 |
| **Traffic Peak** | 2.000–3.000 concurrent users saat buka registrasi |
| **Core Message** | "Beyond Frontiers: Technology for a Sustainable and Human-Centered Future" |
| **Tone** | Futuristik tapi accessible — physics-inspired, bukan korporat |

---

## 1. Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────┐
│                    User (Browser)                        │
└──────────────────────────┬──────────────────────────────┘
                           │
          ┌────────────────▼────────────────┐
          │     Next.js 14 (App Router)      │
          │   TypeScript · Tailwind CSS      │
          │   shadcn/ui · Framer Motion      │
          └──┬──────────┬──────────┬─────────┘
             │          │          │
      ┌──────▼───┐  ┌───▼────┐  ┌─▼──────────┐
      │ Middleware│  │/app/api│  │  Pages &   │
      │Auth Guard │  │Routes  │  │ Components │
      └──────┬───┘  └───┬────┘  └────────────┘
             │           │
   ┌─────────▼───────────▼──────────────────────────────┐
   │                External Services                    │
   ├──────────┬──────────┬──────────┬──────────┬────────┤
   │ Supabase │Sanity CMS│Cloudinary│  Mapbox  │ Resend │
   │DB+Auth+  │ Konten & │ Foto &   │Interactive│ Email  │
   │ Storage  │ Artikel  │  Video   │   Map    │Konfirm.│
   └──────────┴──────────┴──────────┴──────────┴────────┘
             │
   ┌─────────▼─────────┐
   │   Vercel / Netlify │
   │  Hosting + CI/CD   │
   └───────────────────┘
```

**Pola:** Monolith Next.js — tidak ada backend server terpisah. Semua business logic ada di `/app/api` Route Handlers.

---

## 2. Tech Stack Lengkap

| Layer | Teknologi | Keterangan |
|-------|-----------|------------|
| **Framework** | Next.js 14 (App Router) | SSR + SSG, `/app` directory |
| **Language** | TypeScript | Strict mode |
| **Styling** | Tailwind CSS v3 + shadcn/ui | Design system utama |
| **Animation** | Framer Motion | Page transitions, scroll-triggered |
| **Database** | Supabase PostgreSQL | Data transaksional |
| **Auth** | Supabase Auth | Google OAuth + Magic Link |
| **Storage** | Supabase Storage (demo) → Cloudinary (prod) | Aset media |
| **CMS** | Sanity.io | Berita, artikel, deskripsi event |
| **Maps** | Mapbox GL JS | Peta venue interaktif ITB |
| **Email** | Resend | Konfirmasi registrasi |
| **Hosting** | Netlify (free, tanpa restriksi ToS) | **BUKAN Vercel Hobby** |
| **CI/CD** | GitHub Actions | Auto-deploy ke Netlify |
| **Monitoring** | Sentry (free tier) | Error tracking production |

> ⚠️ **PENTING:** Jangan pakai Vercel Hobby Plan. Website event organisasi masuk kategori komersial dan berisiko suspend tanpa peringatan. Pakai **Netlify** (free, no ToS restriction) untuk demo dan pengembangan awal.

---

## 3. Tujuan Quick Demo

Demo ini bukan prototype kosmetik — ini adalah **proof-of-concept yang menyentuh semua layer stack**. Setelah demo, tim dan stakeholder harus bisa melihat:

1. **Auth flow nyata** — Google OAuth via Supabase, bukan mock
2. **Registration form nyata** — data masuk ke Supabase DB
3. **CMS terkoneksi** — konten dari Sanity tampil di halaman
4. **Animasi "wow factor"** — particle hero + Framer Motion scroll
5. **Map interaktif** — Mapbox dengan minimal 1 pin venue ITB
6. **Email terkirim** — konfirmasi via Resend setelah registrasi
7. **Deploy live** — bisa dibuka siapapun via URL Netlify

**Fitur PRD yang dipilih untuk demo:** `CPP-01 (Auth Terpadu)` + `MH-01 (Registrasi Lomba)` — ini adalah flow paling kritikal dan paling sering ditanya stakeholder.

---

## 4. Struktur Direktori

```
demo-web/
├── .env.local                  # ← API keys (JANGAN di-commit)
├── .env.example                # Template env vars
├── .gitignore
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
│
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout + providers
│   ├── page.tsx                # Landing / Homepage
│   ├── globals.css
│   │
│   ├── (public)/               # Route group — halaman publik
│   │   ├── about/page.tsx
│   │   ├── program/page.tsx
│   │   ├── competitions/
│   │   │   ├── page.tsx        # Daftar semua lomba (dari Sanity)
│   │   │   └── [slug]/page.tsx # Detail lomba
│   │   ├── news/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── map/page.tsx        # Peta venue Mapbox
│   │   └── sponsors/page.tsx
│   │
│   ├── (auth)/                 # Route group — auth pages
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── callback/page.tsx   # Supabase OAuth callback
│   │
│   ├── dashboard/              # Protected — butuh login
│   │   ├── layout.tsx          # Auth guard middleware
│   │   ├── page.tsx            # Hub utama peserta
│   │   ├── register-competition/page.tsx
│   │   └── my-tickets/page.tsx # QR tiket masuk
│   │
│   └── api/                    # API Route Handlers
│       ├── register/route.ts   # POST: simpan registrasi lomba
│       ├── send-email/route.ts # POST: trigger Resend email
│       └── competitions/route.ts # GET: fetch dari Sanity
│
├── components/
│   ├── ui/                     # shadcn/ui components (auto-generated)
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── landing/
│   │   ├── HeroParticles.tsx   # Physics-based particle animation
│   │   ├── CountdownTimer.tsx
│   │   └── ProgramHighlights.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── dashboard/
│   │   ├── ProfileCard.tsx
│   │   ├── QRTicket.tsx
│   │   └── CompetitionStatus.tsx
│   └── map/
│       └── VenueMap.tsx        # Mapbox component
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser client
│   │   ├── server.ts           # Server component client
│   │   └── middleware.ts       # Auth middleware helper
│   ├── sanity/
│   │   ├── client.ts
│   │   └── queries.ts          # GROQ queries
│   ├── resend/
│   │   └── emails.ts           # Email templates
│   └── utils.ts
│
├── types/
│   ├── database.types.ts       # Auto-generated dari Supabase
│   ├── sanity.types.ts
│   └── index.ts
│
├── sanity/                     # Sanity Studio (embedded)
│   ├── sanity.config.ts
│   └── schemas/
│       ├── competition.ts
│       ├── article.ts
│       └── event.ts
│
└── public/
    ├── og-image.png
    └── favicon.ico
```

---

## 5. Milestone per Phase

### Phase 0 — Setup & Scaffolding (Hari 1)
**Target:** Repo jalan di lokal, semua service terkoneksi

- [ ] `npx create-next-app@latest demo-web --typescript --tailwind --app`
- [ ] Install dependencies: `framer-motion`, `@supabase/supabase-js`, `@supabase/ssr`, `next-sanity`, `@sanity/client`, `mapbox-gl`, `resend`, `qrcode.react`
- [ ] Setup shadcn/ui: `npx shadcn@latest init`
- [ ] Buat project di Supabase → jalankan SQL schema (lihat bagian 6)
- [ ] Buat project di Sanity → define schema awal
- [ ] Daftar Resend → dapat API key
- [ ] Daftar Mapbox → dapat public token
- [ ] Setup `.env.local` dengan semua keys
- [ ] Push ke GitHub, connect ke Netlify, set env vars di Netlify

**Deliverable:** `localhost:3000` tampil halaman kosong, semua env vars valid

---

### Phase 1 — Core Feature: Auth + Landing (Hari 2-3)
**Target:** User bisa login dan mendarat di dashboard

- [ ] **Landing page** dengan:
  - Hero section + particle animation (canvas-based, pakai `tsparticles` atau custom canvas)
  - Countdown timer ke tanggal event (hardcode dulu)
  - Stats counter (hardcode dulu)
  - Program highlights cards
- [ ] **Auth pages** (Login + Register):
  - Google OAuth via Supabase
  - Magic link (email OTP) sebagai fallback
  - Form pembuatan akun (nama, email, institusi, status)
- [ ] **Middleware** auth guard untuk route `/dashboard/*`
- [ ] **Callback handler** `/auth/callback` untuk Supabase redirect

**Deliverable:** User bisa Google OAuth → redirect ke `/dashboard` → logout

---

### Phase 2 — Featured Demo: Competition Registration (Hari 4-5)
**Target:** End-to-end flow registrasi lomba yang menjadi showcase utama

- [ ] **Sanity Schema** untuk `competition`: nama, slug, deskripsi, tanggal, format tim, syarat berkas
- [ ] **Halaman `/competitions`**: fetch dari Sanity, tampilkan card tiap lomba
- [ ] **Halaman `/competitions/[slug]`**: detail lomba lengkap
- [ ] **Dashboard `/dashboard/register-competition`**:
  - Pilih lomba (dropdown dari Supabase/Sanity)
  - Isi data tim (nama tim, anggota, institusi per anggota)
  - Upload berkas pendukung ke Supabase Storage
  - Submit → simpan ke Supabase DB
- [ ] **API Route `/api/register`**: validasi data, insert ke DB, trigger email
- [ ] **Email konfirmasi** via Resend dengan data registrasi
- [ ] **Dashboard status**: tampilkan status registrasi (Pending/Terverifikasi)

**Deliverable:** Login → pilih lomba → isi form → submit → email masuk → status muncul di dashboard

---

### Phase 3 — Map + Media (Hari 6-7)
**Target:** Fitur diferensiator visual yang bikin "wow"

- [ ] **Mapbox map** di `/map`:
  - Embed peta area kampus ITB Bandung (koordinat: `-6.8917, 107.6106`)
  - Minimal 3 pin venue: Aula Timur, Labtek, Sasana Budaya Ganesha
  - Klik pin → popup dengan info kegiatan
  - Filter tombol: Lomba / Pameran / Semua
- [ ] **Galeri media** (placeholder dengan Supabase Storage):
  - Grid foto dengan lazy loading
  - Lightbox on click
- [ ] **Framer Motion polish**:
  - Page transition antara halaman
  - Scroll-triggered reveal untuk section di landing
  - Stagger animation untuk card grids

**Deliverable:** Map interaktif berjalan, halaman terasa smooth dan "mahal"

---

### Phase 4 — Content + Polish (Hari 8)
**Target:** Demo siap dipresentasikan ke stakeholder

- [ ] **Halaman News** dari Sanity (minimal 2 artikel sample)
- [ ] **Halaman About** + Sponsors (static, bisa hardcode)
- [ ] **QR Ticket** di dashboard (generate dari user ID)
- [ ] **Responsive design** check (mobile-first)
- [ ] **OG image** untuk social sharing
- [ ] Final deploy ke Netlify dengan custom subdomain
- [ ] Lighthouse audit — target score > 80

---

## 6. Database Schema (Supabase)

Jalankan SQL ini di Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users profile (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  institution TEXT,
  status TEXT CHECK (status IN ('mahasiswa', 'profesional', 'umum')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Competition table (data statis, nanti bisa pindah ke Sanity)
CREATE TABLE public.competitions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT, -- 'robotika', 'paper', 'hackathon', etc.
  team_min INT DEFAULT 1,
  team_max INT DEFAULT 5,
  registration_open TIMESTAMPTZ,
  registration_close TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Registration table
CREATE TABLE public.registrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  competition_id UUID REFERENCES public.competitions(id),
  team_name TEXT NOT NULL,
  team_members JSONB NOT NULL, -- [{ name, email, institution, role }]
  document_urls JSONB, -- uploaded file URLs
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RSVP table (general attendance)
CREATE TABLE public.rsvp (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  confirmed_at TIMESTAMPTZ DEFAULT NOW(),
  qr_code TEXT UNIQUE DEFAULT uuid_generate_v4()::TEXT,
  checked_in BOOLEAN DEFAULT false,
  checked_in_at TIMESTAMPTZ
);

-- Feedback table
CREATE TABLE public.feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  booth_id TEXT, -- null = general event feedback
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Users can only read/write their own data
CREATE POLICY "Users manage own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users manage own registrations" ON public.registrations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own rsvp" ON public.rsvp
  FOR ALL USING (auth.uid() = user_id);

-- Competitions are public read
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Competitions are public" ON public.competitions
  FOR SELECT USING (true);

-- Trigger: auto-create profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 7. Environment Variables

Buat file `.env.local` di root `demo-web/`:

```bash
# ============================================
# SUPABASE
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...    # ← JANGAN expose ke client

# ============================================
# SANITY CMS
# ============================================
NEXT_PUBLIC_SANITY_PROJECT_ID=xxxxxxxx
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=sk...                  # Read-only token untuk production

# ============================================
# MAPBOX
# ============================================
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...

# ============================================
# RESEND (Email)
# ============================================
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@itbinsight.id  # Ganti setelah domain live

# ============================================
# APP CONFIG
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_EVENT_DATE=2026-11-15T08:00:00+07:00  # Update sesuai tanggal final
```

Buat juga `.env.example` dengan value dikosongkan — ini yang di-commit ke Git.

---

## 8. Setup per Service

### Supabase
1. Buat project baru di [supabase.com](https://supabase.com)
2. Jalankan SQL schema di bagian 6
3. Di **Authentication → Providers**: aktifkan Google OAuth
   - Isi Client ID & Secret dari Google Cloud Console
   - Tambahkan Redirect URL: `https://xxxx.supabase.co/auth/v1/callback`
4. Di **Authentication → URL Configuration**: tambahkan `http://localhost:3000` ke Redirect URLs
5. Aktifkan **Email OTP** (Magic Link) sebagai alternatif login
6. Di **Storage**: buat bucket `competition-docs` (private) dan `media` (public)

### Sanity
1. `npm create sanity@latest` — pilih "Empty project"
2. Tambahkan schemas di `/sanity/schemas/`:
   - `competition.ts`: fields `title, slug, description, category, teamMin, teamMax, regOpen, regClose, guideBookUrl`
   - `article.ts`: fields `title, slug, body (Portable Text), coverImage, publishedAt, author`
3. Deploy Sanity Studio: `npx sanity deploy`
4. Di **Settings → API**: tambahkan CORS origin `http://localhost:3000`
5. Buat **API Token** dengan permission `viewer` untuk production

### Mapbox
1. Daftar di [mapbox.com](https://mapbox.com) → dapat public token gratis
2. Koordinat kampus ITB Bandung: `[-6.8917, 107.6106]` (lng, lat format Mapbox)
3. Venue pins awal untuk demo:
   - Aula Timur: `[-6.8904, 107.6097]`
   - Labtek VIII: `[-6.8919, 107.6088]`
   - Sasana Budaya Ganesha: `[-6.8960, 107.6096]`

### Resend
1. Daftar di [resend.com](https://resend.com) → free tier: 3.000 email/bulan
2. Verifikasi domain (atau pakai `onboarding@resend.dev` untuk testing)
3. Buat email template konfirmasi registrasi (HTML sederhana dulu)

### Netlify
1. Connect repo GitHub di [netlify.com](https://netlify.com)
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Install Netlify Next.js plugin: tambahkan `@netlify/plugin-nextjs` di `netlify.toml`
5. Set semua env vars di **Site Settings → Environment Variables**

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

---

## 9. Fitur Prioritas Demo (dari PRD)

Feature yang paling penting untuk didemonstrasikan ke stakeholder, berurutan:

| # | Fitur | PRD Ref | Kenapa Penting |
|---|-------|---------|----------------|
| 1 | **Auth terpadu (Google + Magic Link)** | CPP-01 | Gate keeper semua fitur lain |
| 2 | **Registrasi lomba + upload berkas** | MH-01, MH-02 | Fungsi utama website |
| 3 | **Dashboard peserta + status** | CPP-02 | Tunjukkan UX flow end-to-end |
| 4 | **Email konfirmasi otomatis** | CPP-07 | Proof of professionalism |
| 5 | **Hero particle animation + countdown** | CPP-05 | "Wow factor" pertama yang dilihat |
| 6 | **Deskripsi lomba dari CMS** | SH-01 | Tunjukkan Sanity bisa dikelola non-dev |
| 7 | **Peta venue Mapbox** | SH-05 | Differentiator visual kuat |

---

## 10. Kode Starter: Fitur Utama Demo

### A. Supabase Client Setup

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options))
        },
      },
    }
  )
}
```

### B. Auth Middleware

```typescript
// middleware.ts (di root project)
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // Protect /dashboard routes
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return supabaseResponse
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
```

### C. Registration API Route

```typescript
// app/api/register/route.ts
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const body = await request.json()
  const { competitionId, teamName, teamMembers } = body
  
  // Insert registration
  const { data, error } = await supabase
    .from('registrations')
    .insert({
      user_id: user.id,
      competition_id: competitionId,
      team_name: teamName,
      team_members: teamMembers,
      status: 'pending',
    })
    .select()
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  // Send confirmation email
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: user.email!,
    subject: `[ITB Insight] Registrasi ${teamName} Berhasil!`,
    html: `
      <h2>Selamat, ${teamName}!</h2>
      <p>Registrasi lomba kalian telah diterima.</p>
      <p><strong>Status:</strong> Menunggu Verifikasi</p>
      <p>Kami akan mengirim konfirmasi setelah berkas diverifikasi panitia.</p>
      <br>
      <p>Salam,<br>Tim ITB Insight</p>
    `,
  })
  
  return NextResponse.json({ success: true, registration: data })
}
```

### D. Particle Hero Component (Canvas-based)

```typescript
// components/landing/HeroParticles.tsx
'use client'
import { useEffect, useRef } from 'react'

interface Particle {
  x: number; y: number; vx: number; vy: number; radius: number; opacity: number
}

export function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    let animId: number
    
    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)
    
    const particles: Particle[] = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.2,
    }))
    
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Draw connections
      particles.forEach((p, i) => {
        particles.slice(i + 1).forEach(q => {
          const dist = Math.hypot(p.x - q.x, p.y - q.y)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
            ctx.strokeStyle = `rgba(99, 179, 237, ${(1 - dist / 120) * 0.3})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })
      
      // Draw particles
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(99, 179, 237, ${p.opacity})`
        ctx.fill()
      })
      
      animId = requestAnimationFrame(draw)
    }
    draw()
    
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])
  
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
```

### E. Sanity GROQ Queries

```typescript
// lib/sanity/queries.ts
import { defineQuery } from 'next-sanity'

export const competitionsQuery = defineQuery(`
  *[_type == "competition" && isActive == true] | order(regOpen asc) {
    _id, title, slug, description, category,
    teamMin, teamMax, regOpen, regClose,
    "guideBookUrl": guideBook.asset->url
  }
`)

export const competitionBySlugQuery = defineQuery(`
  *[_type == "competition" && slug.current == $slug][0] {
    _id, title, slug, description, category,
    teamMin, teamMax, regOpen, regClose,
    requirements, timeline,
    "guideBookUrl": guideBook.asset->url
  }
`)

export const articlesQuery = defineQuery(`
  *[_type == "article"] | order(publishedAt desc)[0..9] {
    _id, title, slug, publishedAt,
    "excerpt": pt::text(body)[0..200],
    "coverImageUrl": coverImage.asset->url,
    "author": author->name
  }
`)
```

---

## 11. Catatan Risiko & Trade-off

| Risiko | Dampak | Mitigasi |
|--------|--------|----------|
| Supabase free tier cold start saat spike | Auth lambat / timeout | Upgrade ke Pro sebelum Agustus |
| Vercel Hobby ToS violation | Site di-suspend tanpa warning | Pakai Netlify dari awal |
| Sanity rate limit free tier | Konten tidak muncul | Cache dengan `next: { revalidate: 3600 }` |
| Mapbox token exposed di client | Quota abuse | Set allowed URLs di Mapbox dashboard |
| Resend 3K limit habis | Email tidak terkirim | Monitor quota, upgrade Oktober |

---

## 12. Definition of Done — Quick Demo

Demo dianggap selesai dan siap dipresentasikan jika semua item ini ✅:

- [ ] URL live dapat dibuka tanpa error (Netlify)
- [ ] Google OAuth berhasil login dan redirect ke dashboard
- [ ] Form registrasi lomba berhasil submit → data muncul di Supabase dashboard
- [ ] Email konfirmasi masuk ke inbox setelah registrasi
- [ ] Deskripsi minimal 1 lomba muncul dari Sanity CMS
- [ ] Peta Mapbox menampilkan area kampus ITB dengan minimal 1 pin
- [ ] Particle animation berjalan di hero landing page
- [ ] Countdown menampilkan waktu mundur
- [ ] Halaman responsive di mobile (375px)
- [ ] Tidak ada console error di browser

---

## 13. Referensi & Tautan Penting

- **Wireframe v2:** `/itb_insight_wireframe_v2.html` (lihat di project files)
- **PRD:** `/PRD_ITB_Insight.pdf`
- **Tech Planning Doc:** `/TechnicalPlanningDocument.pdf`
- **Contoh web acara sejenis:** https://www.technocorner.id/en/
- **Supabase SSR docs:** https://supabase.com/docs/guides/auth/server-side/nextjs
- **Sanity Next.js guide:** https://www.sanity.io/guides/nextjs-app-router-live-preview
- **Mapbox GL JS:** https://docs.mapbox.com/mapbox-gl-js/
- **Resend Next.js:** https://resend.com/docs/send-with-nextjs
- **shadcn/ui:** https://ui.shadcn.com
- **Framer Motion:** https://www.framer.com/motion/

---

*Dokumen ini dibuat untuk transfer konteks ke Copilot/AI agent. Update setiap kali ada perubahan arsitektur atau keputusan teknis baru.*
