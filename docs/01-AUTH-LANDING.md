# Phase 1: Core Feature — Auth + Landing 🔐

**Timeline:** Hari 2-3  
**Goal:** User bisa login & mendarat di dashboard  
**Target Deliverable:** User bisa Google OAuth → redirect ke `/dashboard` → logout

---

## Checklist

- [ ] Create Landing page dengan hero section & particle animation
- [ ] Add countdown timer ke event date
- [ ] Add stats counter (hardcode)
- [ ] Create program highlights cards
- [ ] Setup auth pages (Login + Register)
- [ ] Implement Google OAuth via Supabase
- [ ] Add Magic Link (email OTP) fallback
- [ ] Create auth middleware guard
- [ ] Create `/auth/callback` handler
- [ ] Create dashboard layout + auth check

---

## Step 1: Create Folder Structure

```
app/
├── layout.tsx              # Root layout
├── page.tsx                # Landing page
├── globals.css
├── (public)/               # Public pages
│   ├── about/page.tsx
│   ├── program/page.tsx
│   └── ...
├── (auth)/                 # Auth pages
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── callback/page.tsx
└── dashboard/              # Protected
    ├── layout.tsx          # Auth guard
    ├── page.tsx            # Hub peserta
    └── ...

components/
├── ui/                     # shadcn/ui (auto-generated)
├── landing/
│   ├── HeroParticles.tsx
│   ├── CountdownTimer.tsx
│   └── ProgramHighlights.tsx
├── auth/
│   ├── LoginForm.tsx
│   └── RegisterForm.tsx
└── ...

lib/
├── supabase/
│   ├── client.ts
│   ├── server.ts
│   └── middleware.ts
└── ...
```

---

## Step 2: Setup Supabase Client

**lib/supabase/client.ts:**
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**lib/supabase/server.ts:**
```typescript
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

---

## Step 3: Create Auth Middleware

**middleware.ts** (di root project):
```typescript
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
  
  // Redirect ke login jika akses /dashboard tanpa auth
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return supabaseResponse
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
```

---

## Step 4: Create Login Form Component

**components/auth/LoginForm.tsx:**
```typescript
'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function LoginForm() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')

  const handleGoogleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })
    if (error) console.error(error)
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })
    if (!error) {
      alert('Check your email for magic link!')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto p-6 border rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      
      <Button 
        onClick={handleGoogleLogin} 
        disabled={loading}
        className="w-full mb-4"
      >
        Sign in with Google
      </Button>

      <div className="divider my-4">Or</div>

      <form onSubmit={handleMagicLink} className="space-y-4">
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        />
        <Button type="submit" disabled={loading} className="w-full">
          Send Magic Link
        </Button>
      </form>
    </div>
  )
}
```

---

## Step 5: Create Auth Callback Handler

**app/(auth)/callback/page.tsx:**
```typescript
'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function CallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      if (code) {
        await supabase.auth.exchangeCodeForSession(code)
      }
      router.push('/dashboard')
    }
    handleCallback()
  }, [])

  return <div>Redirecting...</div>
}
```

---

## Step 6: Create Hero Particles Component

**components/landing/HeroParticles.tsx:**
```typescript
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
    
    return () => { 
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize) 
    }
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

---

## Step 7: Create Countdown Timer

**components/landing/CountdownTimer.tsx:**
```typescript
'use client'
import { useEffect, useState } from 'react'

export function CountdownTimer() {
  const [time, setTime] = useState({
    days: 0, hours: 0, minutes: 0, seconds: 0
  })

  useEffect(() => {
    const eventDate = new Date(process.env.NEXT_PUBLIC_EVENT_DATE!).getTime()
    
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const diff = eventDate - now
      
      if (diff > 0) {
        setTime({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        })
      }
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex gap-4 justify-center my-8">
      {Object.entries(time).map(([key, value]) => (
        <div key={key} className="text-center">
          <div className="text-3xl font-bold text-blue-600">{value}</div>
          <div className="text-sm capitalize">{key}</div>
        </div>
      ))}
    </div>
  )
}
```

---

## Step 8: Create Dashboard Layout (Protected)

**app/dashboard/layout.tsx:**
```typescript
'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
      }
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div>
      <nav className="bg-blue-600 text-white p-4 flex justify-between">
        <h1 className="text-xl font-bold">ITB Insight Dashboard</h1>
        <div className="space-x-4">
          <span>{user?.email}</span>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>
      </nav>
      <main className="p-8">{children}</main>
    </div>
  )
}
```

**app/dashboard/page.tsx:**
```typescript
'use client'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(data)
      }
    }
    getProfile()
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Selamat datang!</h1>
      {profile && (
        <div className="bg-gray-100 p-4 rounded">
          <p><strong>Nama:</strong> {profile.full_name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Institusi:</strong> {profile.institution}</p>
        </div>
      )}
    </div>
  )
}
```

---

## Step 9: Test Auth Flow

```bash
npm run dev
```

**Test cases:**
1. ✅ Klik "Sign in with Google" → redirect ke Google
2. ✅ Setelah approve → redirect ke `/dashboard`
3. ✅ Tampil profile user
4. ✅ Klik logout → redirect ke home

---

## Next Phase
Ketika Phase 1 selesai → Lanjut ke **Phase 2: Competition Registration** (02-COMPETITION.md)
