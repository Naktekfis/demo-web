import './globals.css'
import React from 'react'
import { Gabarito, Roboto_Mono } from "next/font/google"
import { cn } from "@/lib/utils"
import { Header } from '@/components/header'

const gabarito = Gabarito({ subsets: ['latin'], variable: '--font-heading' })
const robotoMono = Roboto_Mono({ subsets: ['latin'], variable: '--font-sans' })

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'ITB Insight 2026 - Tech Exhibition',
  description: 'Platform kompetisi, workshop, dan pameran teknologi terbesar di Institut Teknologi Bandung.',
  openGraph: {
    title: 'ITB Insight 2026',
    description: 'Tech exhibition terbesar kedua di ITB. Ikuti berbagai kompetisi dan acara inovatif!',
    url: 'https://itb-insight.vercel.app',
    siteName: 'ITB Insight',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ITB Insight 2026',
    description: 'Tech exhibition terbesar kedua di ITB.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={cn('font-sans', gabarito.variable, robotoMono.variable)}>
      <body className="bg-slate-50 text-slate-800">
        <Header />
        {children}
      </body>
    </html>
  )
}
