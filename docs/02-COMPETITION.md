# Phase 2: Featured Demo — Competition Registration 🏆

**Timeline:** Hari 4-5  
**Goal:** End-to-end flow registrasi lomba yang menjadi showcase utama  
**Target Deliverable:** Login → pilih lomba → isi form → submit → email masuk → status di dashboard

---

## Checklist

- [ ] Create Sanity schema untuk competition
- [ ] Create halaman `/competitions` (list semua lomba)
- [ ] Create halaman `/competitions/[slug]` (detail lomba)
- [ ] Create registration form di dashboard
- [ ] Create API route `/api/register`
- [ ] Implement file upload ke Supabase Storage
- [ ] Send email konfirmasi via Resend
- [ ] Display registration status di dashboard

---

## Step 1: Create Sanity Schema

**sanity/schemas/competition.ts:**
```typescript
export const competition = {
  name: 'competition',
  title: 'Competition',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (Rule: any) => Rule.required().unique(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'blockContent',
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Robotika', value: 'robotika' },
          { title: 'Paper', value: 'paper' },
          { title: 'Hackathon', value: 'hackathon' },
          { title: 'Lainnya', value: 'other' },
        ],
      },
    },
    {
      name: 'teamMin',
      title: 'Min Team Size',
      type: 'number',
      initialValue: 1,
    },
    {
      name: 'teamMax',
      title: 'Max Team Size',
      type: 'number',
      initialValue: 5,
    },
    {
      name: 'regOpen',
      title: 'Registration Opens',
      type: 'datetime',
    },
    {
      name: 'regClose',
      title: 'Registration Closes',
      type: 'datetime',
    },
    {
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      initialValue: true,
    },
    {
      name: 'requirements',
      title: 'Requirements',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'guideBook',
      title: 'Guide Book (PDF)',
      type: 'file',
      options: { accept: '.pdf' },
    },
  ],
}
```

---

## Step 2: Create Sanity Queries

**lib/sanity/queries.ts:**
```typescript
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
```

**lib/sanity/client.ts:**
```typescript
import { createClient } from 'next-sanity'

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  useCdn: true,
})
```

---

## Step 3: Create Competitions Listing Page

**app/(public)/competitions/page.tsx:**
```typescript
import { sanityClient } from '@/lib/sanity/client'
import { competitionsQuery } from '@/lib/sanity/queries'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function CompetitionsPage() {
  const competitions = await sanityClient.fetch(competitionsQuery)

  return (
    <div className="max-w-6xl mx-auto py-12">
      <h1 className="text-4xl font-bold mb-8">Kompetisi & Lomba</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {competitions.map((comp: any) => (
          <Link key={comp._id} href={`/competitions/${comp.slug.current}`}>
            <Card className="hover:shadow-lg transition">
              <CardHeader>
                <CardTitle>{comp.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">{comp.category}</p>
                <p className="text-sm mb-4">Tim: {comp.teamMin} - {comp.teamMax} orang</p>
                <button className="text-blue-600 hover:underline">
                  Lihat Detail →
                </button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

---

## Step 4: Create Competition Detail Page

**app/(public)/competitions/[slug]/page.tsx:**
```typescript
import { sanityClient } from '@/lib/sanity/client'
import { competitionBySlugQuery } from '@/lib/sanity/queries'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PortableText } from 'next-sanity'

export default async function CompetitionDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const competition = await sanityClient.fetch(competitionBySlugQuery, {
    slug: params.slug,
  })

  if (!competition) {
    return <div className="text-center py-12">Kompetisi tidak ditemukan</div>
  }

  return (
    <div className="max-w-4xl mx-auto py-12">
      <h1 className="text-4xl font-bold mb-4">{competition.title}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 p-4 rounded">
          <p className="text-sm text-gray-600">Kategori</p>
          <p className="text-lg font-bold capitalize">{competition.category}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded">
          <p className="text-sm text-gray-600">Ukuran Tim</p>
          <p className="text-lg font-bold">
            {competition.teamMin} - {competition.teamMax} orang
          </p>
        </div>
        <div className="bg-blue-50 p-4 rounded">
          <p className="text-sm text-gray-600">Pendaftaran Tutup</p>
          <p className="text-lg font-bold">
            {new Date(competition.regClose).toLocaleDateString('id-ID')}
          </p>
        </div>
      </div>

      <div className="prose max-w-none mb-8">
        <PortableText value={competition.description} />
      </div>

      {competition.requirements && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Persyaratan</h2>
          <ul className="list-disc pl-6 space-y-2">
            {competition.requirements.map((req: string, i: number) => (
              <li key={i}>{req}</li>
            ))}
          </ul>
        </div>
      )}

      {competition.guideBookUrl && (
        <div className="mb-8">
          <a 
            href={competition.guideBookUrl}
            target="_blank"
            className="text-blue-600 hover:underline"
          >
            📄 Download Buku Panduan
          </a>
        </div>
      )}

      <Link href={`/dashboard/register-competition?comp=${params.slug}`}>
        <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
          Daftar Sekarang
        </Button>
      </Link>
    </div>
  )
}
```

---

## Step 5: Create Registration Form Component

**components/dashboard/CompetitionRegisterForm.tsx:**
```typescript
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function CompetitionRegisterForm({ competition }: { competition: any }) {
  const router = useRouter()
  const supabase = createClient()
  
  const [teamName, setTeamName] = useState('')
  const [teamMembers, setTeamMembers] = useState([
    { name: '', email: '', institution: '', role: 'Member' }
  ])
  const [loading, setLoading] = useState(false)

  const handleAddMember = () => {
    setTeamMembers([
      ...teamMembers,
      { name: '', email: '', institution: '', role: 'Member' }
    ])
  }

  const handleMemberChange = (index: number, field: string, value: string) => {
    const updated = [...teamMembers]
    updated[index] = { ...updated[index], [field]: value }
    setTeamMembers(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competitionId: competition._id,
          competitionSlug: competition.slug,
          teamName,
          teamMembers,
        }),
      })

      if (!response.ok) throw new Error('Registration failed')

      alert('Pendaftaran berhasil! Cek email Anda.')
      router.push('/dashboard')
    } catch (error) {
      alert(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Nama Tim</label>
        <input
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded"
          placeholder="Nama tim Anda"
        />
      </div>

      <div>
        <h3 className="text-lg font-bold mb-4">Anggota Tim</h3>
        {teamMembers.map((member, idx) => (
          <div key={idx} className="bg-gray-50 p-4 rounded mb-4 space-y-3">
            <input
              type="text"
              placeholder="Nama"
              value={member.name}
              onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
              required
              className="w-full px-3 py-2 border rounded"
            />
            <input
              type="email"
              placeholder="Email"
              value={member.email}
              onChange={(e) => handleMemberChange(idx, 'email', e.target.value)}
              required
              className="w-full px-3 py-2 border rounded"
            />
            <input
              type="text"
              placeholder="Institusi"
              value={member.institution}
              onChange={(e) => handleMemberChange(idx, 'institution', e.target.value)}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        ))}

        {teamMembers.length < competition.teamMax && (
          <Button type="button" onClick={handleAddMember} variant="outline">
            + Tambah Anggota
          </Button>
        )}
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Mengirim...' : 'Daftar Sekarang'}
      </Button>
    </form>
  )
}
```

---

## Step 6: Create Registration API Route

**app/api/register/route.ts:**
```typescript
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { competitionId, competitionSlug, teamName, teamMembers } = await request.json()
    
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
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Selamat, ${teamName}! 🎉</h2>
          <p>Registrasi lomba kalian telah diterima dengan baik.</p>
          
          <div style="background: #f0f9ff; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Nama Tim:</strong> ${teamName}</p>
            <p><strong>Status:</strong> Menunggu Verifikasi</p>
            <p><strong>Jumlah Anggota:</strong> ${teamMembers.length}</p>
          </div>
          
          <p>Kami akan mengirim konfirmasi setelah berkas diverifikasi panitia.</p>
          <p>Hubungi kami di: contact@itbinsight.id</p>
          
          <br>
          <p>Salam,<br><strong>Tim ITB Insight</strong></p>
        </div>
      `,
    })
    
    return NextResponse.json({ success: true, registration: data })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
```

---

## Step 7: Create Dashboard Registration Page

**app/dashboard/register-competition/page.tsx:**
```typescript
'use client'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { sanityClient } from '@/lib/sanity/client'
import { competitionBySlugQuery } from '@/lib/sanity/queries'
import { CompetitionRegisterForm } from '@/components/dashboard/CompetitionRegisterForm'

export default function RegisterCompetitionPage() {
  const searchParams = useSearchParams()
  const competitionSlug = searchParams.get('comp')
  const [competition, setCompetition] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      if (competitionSlug) {
        const data = await sanityClient.fetch(competitionBySlugQuery, {
          slug: competitionSlug,
        })
        setCompetition(data)
      }
      setLoading(false)
    }
    fetch()
  }, [competitionSlug])

  if (loading) return <div>Loading...</div>
  if (!competition) return <div>Kompetisi tidak ditemukan</div>

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Daftar: {competition.title}</h1>
      <CompetitionRegisterForm competition={competition} />
    </div>
  )
}
```

---

## Step 8: Update Dashboard to Show Registrations

**app/dashboard/page.tsx** (update):
```typescript
'use client'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function DashboardPage() {
  const supabase = createClient()
  const [registrations, setRegistrations] = useState([])

  useEffect(() => {
    const getRegistrations = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('registrations')
          .select('*')
          .eq('user_id', user.id)
        setRegistrations(data || [])
      }
    }
    getRegistrations()
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard Peserta</h1>
      
      <div className="mb-8">
        <Link href="/competitions">
          <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
            Lihat Kompetisi & Daftar
          </button>
        </Link>
      </div>

      <h2 className="text-2xl font-bold mb-4">Pendaftaran Saya</h2>
      {registrations.length === 0 ? (
        <p className="text-gray-600">Belum ada pendaftaran</p>
      ) : (
        <div className="grid gap-4">
          {registrations.map((reg: any) => (
            <Card key={reg.id}>
              <CardHeader>
                <CardTitle>{reg.team_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p><strong>Status:</strong> <span className="badge badge-info">{reg.status}</span></p>
                <p><strong>Anggota:</strong> {reg.team_members.length} orang</p>
                <p className="text-sm text-gray-600">
                  Didaftar: {new Date(reg.created_at).toLocaleDateString('id-ID')}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## Testing Checklist

- [ ] Halaman `/competitions` menampilkan list dari Sanity
- [ ] Click halaman kompetisi → detail muncul
- [ ] Login → klik "Daftar" → form muncul
- [ ] Isi form → submit
- [ ] Data muncul di Supabase `registrations` table
- [ ] Email konfirmasi masuk
- [ ] Dashboard menampilkan registrations list dengan status "pending"

---

## Next Phase
Ketika Phase 2 selesai → Lanjut ke **Phase 3: Map + Media** (03-MAP-MEDIA.md)
