import './globals.css'
import React from 'react'
import { Inter } from "next/font/google"
import { cn } from "@/lib/utils"
import { Header } from '@/components/header'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata = {
  title: 'ITB Insight Demo',
  description: 'Demo web for ITB Insight event',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={cn('font-sans', inter.variable)}>
      <body className="bg-slate-50 text-slate-800">
        <Header />
        {children}
      </body>
    </html>
  )
}
