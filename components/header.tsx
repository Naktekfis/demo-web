import Link from 'next/link'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Header() {
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
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/competitions">Kompetisi</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          <Button asChild size="sm" className="rounded-full px-4">
            <Link href="/dashboard">Masuk</Link>
          </Button>
        </div>
      </nav>
    </header>
  )
}
