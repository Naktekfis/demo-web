import Link from 'next/link'
import { Menu, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HeaderClient } from '@/components/header-client'

export async function Header() {
  // Note: Auth check would happen server-side in a real app
  // For now, we'll use the client component for interactivity
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/50 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-10 lg:px-12">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold text-slate-950">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
            <span className="text-sm font-bold">I</span>
          </div>
          <span className="hidden sm:inline">ITB Insight</span>
        </Link>

        {/* Menu */}
        <HeaderClient />
      </nav>
    </header>
  )
}
