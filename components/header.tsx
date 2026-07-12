import Link from 'next/link'
import Image from 'next/image'
import { HeaderClient } from '@/components/header-client'

export async function Header() {
  // Note: Auth check would happen server-side in a real app
  // For now, we'll use the client component for interactivity
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/50 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-10 lg:px-12">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold text-slate-950" aria-label="ITB Insight home">
          <Image src="/brand/logo-black-text.svg" alt="ITB Insight" width={224} height={56} className="h-12 w-auto sm:h-14" priority />
        </Link>

        {/* Menu */}
        <HeaderClient />
      </nav>
    </header>
  )
}
