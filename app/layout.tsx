import './globals.css'
import React from 'react'
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata = {
  title: 'ITB Insight Demo',
  description: 'Demo web for ITB Insight event',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={cn("font-sans", geist.variable)}>
      <body className="bg-white text-slate-800">
        {children}
      </body>
    </html>
  )
}
