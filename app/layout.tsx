import './globals.css'
import React from 'react'

export const metadata = {
  title: 'ITB Insight Demo',
  description: 'Demo web for ITB Insight event',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-white text-slate-800">
        {children}
      </body>
    </html>
  )
}
