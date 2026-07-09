import Link from 'next/link'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

const adminLinks = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/registrations', label: 'Registrasi' },
  { href: '/admin/visitors', label: 'Pengunjung' },
  { href: '/admin/check-in', label: 'Check-in' },
]

type Tone = 'slate' | 'indigo' | 'green' | 'amber' | 'rose' | 'sky'

const toneClasses: Record<Tone, string> = {
  slate: 'border-slate-200 bg-slate-100 text-slate-700',
  indigo: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  amber: 'border-amber-200 bg-amber-50 text-amber-700',
  rose: 'border-rose-200 bg-rose-50 text-rose-700',
  sky: 'border-sky-200 bg-sky-50 text-sky-700',
}

export function adminStatusTone(status: string): Tone {
  if (status === 'verified' || status === 'paid' || status === 'checked_in') return 'green'
  if (status === 'rejected' || status === 'failed' || status === 'expired' || status === 'cancelled') return 'rose'
  if (status === 'submitted' || status === 'pending') return 'amber'
  return 'slate'
}

export function AdminShell({ children, maxWidth = 'max-w-7xl' }: { children: ReactNode; maxWidth?: string }) {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.14),transparent_34rem),linear-gradient(180deg,#f8fafc_0%,#eef2ff_48%,#f8fafc_100%)] px-5 py-10 sm:px-8 lg:px-12">
      <section className={cn('mx-auto w-full space-y-8', maxWidth)}>{children}</section>
    </main>
  )
}

export function AdminPageHeader({
  title,
  description,
  activeHref,
  actions,
}: {
  title: string
  description?: string
  activeHref: string
  actions?: ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur">
      <div className="flex flex-col gap-6 border-b border-slate-200/80 p-6 lg:flex-row lg:items-end lg:justify-between lg:p-8">
        <div className="max-w-3xl">
          <p className="font-heading text-xs font-black uppercase tracking-[0.32em] text-indigo-600">Admin Command</p>
          <h1 className="mt-3 font-heading text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">{title}</h1>
          {description ? <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      <nav className="flex gap-2 overflow-x-auto px-4 py-3 sm:px-6" aria-label="Admin navigation">
        {adminLinks.map((link) => {
          const active = activeHref === link.href || (link.href !== '/admin' && activeHref.startsWith(link.href))
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition-colors',
                active ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
              )}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export function AdminPanel({
  title,
  children,
  action,
  className,
}: {
  title?: string
  children: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/90 shadow-[0_18px_50px_rgba(15,23,42,0.08)]', className)}>
      {title || action ? (
        <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 bg-slate-50/80 px-5 py-4">
          {title ? <p className="font-heading text-sm font-black uppercase tracking-[0.18em] text-slate-600">{title}</p> : <span />}
          {action}
        </div>
      ) : null}
      {children}
    </div>
  )
}

export function AdminStatCard({ label, value, helper, tone = 'slate' }: { label: string; value: ReactNode; helper?: string; tone?: Tone }) {
  return (
    <div className="rounded-[1.5rem] border border-white/70 bg-white/90 p-5 shadow-[0_16px_42px_rgba(15,23,42,0.08)]">
      <div className={cn('mb-5 inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.16em]', toneClasses[tone])}>{label}</div>
      <p className="font-heading text-4xl font-black tracking-tight text-slate-950">{value}</p>
      {helper ? <p className="mt-2 text-sm text-slate-500">{helper}</p> : null}
    </div>
  )
}

export function AdminBadge({ children, tone = 'slate' }: { children: ReactNode; tone?: Tone }) {
  return <span className={cn('inline-flex rounded-full border px-3 py-1 text-xs font-black capitalize', toneClasses[tone])}>{children}</span>
}
