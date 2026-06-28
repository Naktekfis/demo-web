# Phase 4: Content + Polish 🎨

**Timeline:** Hari 8  
**Goal:** Demo siap dipresentasikan ke stakeholder  
**Target Deliverable:** Lighthouse score > 80, no console errors, fully responsive

---

## Checklist

- [ ] Create News page dari Sanity
- [ ] Create About page + Sponsors section
- [ ] Implement QR Ticket di dashboard
- [ ] Responsive design check (mobile-first)
- [ ] Create OG image untuk social sharing
- [ ] Final Vercel deploy
- [ ] Run Lighthouse audit
- [ ] Test di berbagai browser

---

## Step 1: Create News Schema & Page

**sanity/schemas/article.ts:**
```typescript
export const article = {
  name: 'article',
  title: 'Article',
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
    },
    {
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
    },
    {
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
    },
    {
      name: 'body',
      title: 'Body',
      type: 'blockContent',
    },
    {
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'author' }],
    },
  ],
}
```

**app/(public)/news/page.tsx:**
```typescript
import { sanityClient } from '@/lib/sanity/client'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

const articlesQuery = `
  *[_type == "article"] | order(publishedAt desc)[0..9] {
    _id, title, slug, excerpt, publishedAt,
    "coverImageUrl": coverImage.asset->url,
    "author": author->name
  }
`

export default async function NewsPage() {
  const articles = await sanityClient.fetch(articlesQuery)

  return (
    <div className="max-w-6xl mx-auto py-12">
      <h1 className="text-4xl font-bold mb-4">Berita & Artikel</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article: any, idx: number) => (
          <motion.div
            key={article._id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition"
          >
            {article.coverImageUrl && (
              <Image
                src={article.coverImageUrl}
                alt={article.title}
                width={400}
                height={200}
                className="w-full h-40 object-cover"
              />
            )}
            
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2 line-clamp-2">{article.title}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{article.excerpt}</p>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>{article.author}</span>
                <span>{new Date(article.publishedAt).toLocaleDateString('id-ID')}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
```

---

## Step 2: Create QR Ticket Component

**components/dashboard/QRTicket.tsx:**
```typescript
'use client'
import QRCode from 'qrcode.react'
import { Button } from '@/components/ui/button'

export function QRTicket({ userId, userName }: { userId: string; userName: string }) {
  const qrValue = JSON.stringify({
    userId,
    userName,
    timestamp: new Date().toISOString(),
  })

  const handleDownload = () => {
    const canvas = document.querySelector('canvas')
    if (canvas) {
      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/png')
      link.download = `ticket-${userId}.png`
      link.click()
    }
  }

  return (
    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-lg text-white">
      <h3 className="text-xl font-bold mb-4">Tiket Masuk</h3>
      
      <div className="bg-white p-4 rounded flex justify-center mb-4">
        <QRCode
          value={qrValue}
          size={200}
          level="H"
          includeMargin={true}
        />
      </div>

      <p className="text-sm mb-2"><strong>Nama:</strong> {userName}</p>
      <p className="text-sm mb-4"><strong>User ID:</strong> {userId.slice(0, 8)}...</p>

      <Button onClick={handleDownload} className="w-full bg-white text-blue-600 hover:bg-gray-100">
        📥 Download QR Code
      </Button>
    </div>
  )
}
```

**app/dashboard/my-tickets/page.tsx:**
```typescript
'use client'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { QRTicket } from '@/components/dashboard/QRTicket'

export default function MyTicketsPage() {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Tiket Saya</h1>
      
      {user && (
        <div className="max-w-md">
          <QRTicket userId={user.id} userName={user.user_metadata?.full_name || user.email} />
        </div>
      )}
    </div>
  )
}
```

---

## Step 3: Create About Page

**app/(public)/about/page.tsx:**
```typescript
'use client'
import { motion } from 'framer-motion'

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto py-12">
      <motion.h1 
        className="text-4xl font-bold mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Tentang ITB Insight
      </motion.h1>

      <motion.div
        className="prose max-w-none mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold mb-4">Apa itu ITB Insight?</h2>
        <p>
          ITB Insight adalah tech exhibition terbesar kedua di Institut Teknologi Bandung,
          yang menyelenggarakan berbagai kompetisi, workshop, dan pameran teknologi.
        </p>
      </motion.div>

      <motion.div
        className="bg-blue-50 p-8 rounded-lg mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-2xl font-bold mb-4">🎯 Visi & Misi</h3>
        <ul className="space-y-4">
          <li>
            <strong>Visi:</strong> Memajukan teknologi untuk masa depan yang berkelanjutan
          </li>
          <li>
            <strong>Misi:</strong> Memberikan platform bagi mahasiswa untuk menunjukkan inovasi
          </li>
        </ul>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
      >
        <div className="bg-gradient-to-br from-blue-100 to-blue-50 p-6 rounded-lg">
          <div className="text-3xl mb-2">📊</div>
          <h4 className="font-bold mb-2">2,000+</h4>
          <p className="text-sm">Peserta dari seluruh Indonesia</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-100 to-indigo-50 p-6 rounded-lg">
          <div className="text-3xl mb-2">🏆</div>
          <h4 className="font-bold mb-2">15+</h4>
          <p className="text-sm">Kompetisi & Lomba menarik</p>
        </div>

        <div className="bg-gradient-to-br from-purple-100 to-purple-50 p-6 rounded-lg">
          <div className="text-3xl mb-2">🤝</div>
          <h4 className="font-bold mb-2">50+</h4>
          <p className="text-sm">Partner industri terkemuka</p>
        </div>
      </motion.div>
    </div>
  )
}
```

---

## Step 4: Create OG Image

**public/og-image.png** (buat gambar 1200x630px dengan:)
- Logo ITB Insight
- Text: "ITB Insight 2026 - Tech Exhibition"
- Warna: Blue + Indigo gradient
- Design: Modern, professional

---

## Step 5: Update Layout untuk OG Meta Tags

**app/layout.tsx:**
```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ITB Insight - Tech Exhibition 2026',
  description: 'Platform kompetisi, workshop, dan pameran teknologi terbesar di ITB',
  openGraph: {
    title: 'ITB Insight - Tech Exhibition 2026',
    description: 'Platform kompetisi, workshop, dan pameran teknologi terbesar di ITB',
    image: 'https://yourdomain.com/og-image.png',
    url: 'https://yourdomain.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ITB Insight - Tech Exhibition 2026',
    description: 'Platform kompetisi, workshop, dan pameran teknologi terbesar di ITB',
    images: ['https://yourdomain.com/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
```

---

## Step 6: Responsive Design Checklist

- [ ] Test di iPhone SE (375px)
- [ ] Test di iPad (768px)
- [ ] Test di desktop (1440px)
- [ ] Check untuk:
  - Text readability
  - Button touch targets (min 44px)
  - Form inputs accessible
  - Images load quickly
  - Navigation mobile-friendly

---

## Step 7: Run Lighthouse Audit

```bash
npm install -g lighthouse

# Run audit
lighthouse https://yourdomain.vercel.app --output-path=./lighthouse-report.html
```

**Target scores:**
- Performance: > 80
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

---

## Step 8: Final Deployment

```bash
# Verify everything works
npm run build
npm run dev

# Push to GitHub
git add .
git commit -m "feat: complete demo - all phases ready for presentation"
git push origin main

# Monitor Vercel deploy → https://yourdomain.vercel.app
```

---

## Pre-Presentation Checklist

- [ ] All pages load without error
- [ ] Auth flow works (Google OAuth)
- [ ] Competition registration submits successfully
- [ ] Email konfirmasi masuk
- [ ] Dashboard shows registrations
- [ ] Map displays venues correctly
- [ ] Gallery loads images
- [ ] QR ticket generates
- [ ] All links work
- [ ] No console errors
- [ ] Mobile responsive OK
- [ ] Lighthouse score > 80
- [ ] OG image shows pada social share

---

## Presentation Script

1. **Landing**: "Ini adalah homepage dengan particle animation yang menunjukkan tech vibe"
2. **Auth**: "User bisa login dengan Google OAuth atau magic link"
3. **Competitions**: "List kompetisi dari CMS Sanity - non-dev bisa update"
4. **Registration**: "End-to-end flow: pilih lomba → daftar → email otomatis"
5. **Dashboard**: "Peserta bisa lihat status pendaftaran dan download QR ticket"
6. **Map**: "Lokasi venue interaktif di peta Mapbox"
7. **Performance**: "Lighthouse score 85 - built untuk skala traffic tinggi"

---

## ✅ Definition of Done

Demo selesai ketika:
- ✅ URL live dan dapat dibuka tanpa error
- ✅ Google OAuth bekerja sempurna
- ✅ Registrasi lomba end-to-end working
- ✅ Email terkirim otomatis
- ✅ Sanity CMS terintegrasi
- ✅ Mapbox berfungsi
- ✅ Particle animation + Framer Motion smooth
- ✅ Responsive design OK
- ✅ Lighthouse score > 80
- ✅ No console errors
- ✅ Siap untuk presentation

---

*Demo Ready for Presentation!* 🎉
