'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

const navLinks = [
  { href: '/about', label: 'Tentang' },
  { href: '/competitions', label: 'Kompetisi' },
  { href: '/map', label: 'Peta Venue' },
]

const authenticatedNavLinks = [{ href: '/dashboard', label: 'Dashboard' }]

export function HeaderClient() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user.email ?? null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await createClient().auth.signOut()
    setUserEmail(null)
  }

  const authControl = userEmail ? (
    <button
      onClick={handleLogout}
      className="ml-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      title={userEmail}
    >
      Keluar
    </button>
  ) : (
    <Button asChild size="sm" className="ml-2 rounded-full bg-indigo-600 px-5 hover:bg-indigo-700">
      <Link href="/auth/login">Masuk</Link>
    </Button>
  )

  const visibleNavLinks = userEmail ? [...navLinks, ...authenticatedNavLinks] : navLinks

  return (
    <>
      {/* Desktop Nav */}
      <div className="hidden items-center gap-1 sm:flex">
        {visibleNavLinks.map((link) => {
          const isActive = pathname === link.href || pathname?.startsWith(link.href + '/')
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {link.label}
            </Link>
          )
        })}
        {authControl}
      </div>

      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 sm:hidden"
        aria-label="Toggle menu"
      >
        {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile Nav Overlay */}
      {menuOpen && (
        <div className="absolute left-0 right-0 top-full border-b border-slate-200 bg-white p-4 shadow-lg sm:hidden">
          <div className="flex flex-col gap-2">
            {visibleNavLinks.map((link) => {
              const isActive = pathname === link.href || pathname?.startsWith(link.href + '/')
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
            {userEmail ? (
              <button
                onClick={() => {
                  setMenuOpen(false)
                  handleLogout()
                }}
                className="mt-2 w-full rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Keluar
              </button>
            ) : (
              <Button asChild size="sm" className="mt-2 w-full rounded-full bg-indigo-600 hover:bg-indigo-700">
                <Link href="/auth/login" onClick={() => setMenuOpen(false)}>Masuk</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  )
}
