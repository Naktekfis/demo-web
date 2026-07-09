import Link from 'next/link'
import { redirect } from 'next/navigation'

import { AdminBadge, AdminPageHeader, AdminPanel, AdminShell, adminStatusTone } from '@/components/admin/admin-chrome'
import { Button } from '@/components/ui/button'
import { isAdminUser } from '@/lib/admin'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

type Props = {
  searchParams?: Record<string, string | string[] | undefined>
}

function param(searchParams: Props['searchParams'], key: string) {
  const value = searchParams?.[key]
  return Array.isArray(value) ? value[0] : value || ''
}

export default async function AdminVisitorsPage({ searchParams }: Props) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?next=/admin/visitors')
  if (!(await isAdminUser(user))) redirect('/dashboard')

  let items: Array<{
    id: string
    qrCode: string
    checkedIn: boolean
    checkedInAt: string | null
    name: string
    email: string
    phone: string
    institution: string
  }> = []
  let total = 0
  let error = ''
  const page = Math.max(1, Number(param(searchParams, 'page')) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(param(searchParams, 'pageSize')) || 25))

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    error = 'Konfigurasi server admin belum lengkap.'
  } else {
    try {
      const service = createServiceClient()
      const q = param(searchParams, 'q')
      const checkInStatus = param(searchParams, 'checkInStatus')
      const trimmedQ = q.trim()
      const offset = (page - 1) * pageSize

      let query = service
        .from('visitor_tickets')
        .select('id, qr_code, checked_in, checked_in_at, profiles!inner(id, full_name, email, phone, institution)', {
          count: 'exact',
        })

      if (trimmedQ) {
        query = query.or(
          `qr_code.ilike.%${trimmedQ}%,profiles.full_name.ilike.%${trimmedQ}%,profiles.email.ilike.%${trimmedQ}%,profiles.phone.ilike.%${trimmedQ}%`,
        )
      }

      if (checkInStatus === 'checked_in') {
        query = query.eq('checked_in', true)
      } else if (checkInStatus === 'not_checked_in') {
        query = query.eq('checked_in', false)
      }

      const { data: tickets, error: queryError, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1)

      if (queryError) throw queryError

      items = (tickets || []).map((ticket) => {
        const profile = Array.isArray(ticket.profiles) ? ticket.profiles[0] : ticket.profiles
        return {
          id: ticket.id,
          qrCode: ticket.qr_code,
          checkedIn: ticket.checked_in,
          checkedInAt: ticket.checked_in_at,
          name: profile?.full_name || '-',
          email: profile?.email || '-',
          phone: profile?.phone || '-',
          institution: profile?.institution || '-',
        }
      })
      total = count || 0
    } catch {
      error = 'Gagal memuat daftar pengunjung.'
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const buildPageHref = (p: number) => {
    const params = new URLSearchParams()
    for (const key of ['q', 'checkInStatus']) {
      const value = param(searchParams, key)
      if (value) params.set(key, value)
    }
    if (p > 1) params.set('page', String(p))
    const query = params.toString()
    return `/admin/visitors${query ? `?${query}` : ''}`
  }

  return (
    <AdminShell>
      <AdminPageHeader
        title="Pengunjung"
        description="Pantau tiket QR pengunjung, status gate check-in, dan cari data kontak saat operasional venue berlangsung."
        activeHref="/admin/visitors"
      />

        <form className="grid gap-3 rounded-[1.5rem] border border-white/70 bg-white/90 p-4 shadow-[0_16px_42px_rgba(15,23,42,0.08)] sm:grid-cols-2 lg:grid-cols-6">
          <input name="q" defaultValue={param(searchParams, 'q')} placeholder="Cari nama, email, telepon, QR..." className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 lg:col-span-3" />
          <select name="checkInStatus" defaultValue={param(searchParams, 'checkInStatus')} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100">
            <option value="">Semua check-in</option>
            <option value="checked_in">Sudah check-in</option>
            <option value="not_checked_in">Belum check-in</option>
          </select>
          <Button type="submit" className="rounded-full bg-indigo-600 hover:bg-indigo-700 lg:col-start-6">Terapkan</Button>
        </form>

        {error ? <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800">{error}</div> : null}

        <AdminPanel title={`${total} pengunjung ditemukan`}>
          {items.length === 0 ? (
            <div className="p-8 text-center text-slate-500">Tidak ada pengunjung yang cocok.</div>
          ) : (
            items.map((visitor) => (
              <div key={visitor.id} className="grid gap-4 border-b border-slate-100 px-5 py-5 last:border-0 lg:grid-cols-12 lg:items-center">
                <div className="lg:col-span-3">
                  <p className="font-semibold text-slate-900">{visitor.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{visitor.institution}</p>
                </div>
                <div className="lg:col-span-3">
                  <p className="text-sm text-slate-700">{visitor.email}</p>
                  <p className="mt-1 text-sm text-slate-500">{visitor.phone}</p>
                </div>
                <div className="lg:col-span-2">
                  <p className="font-mono text-xs text-slate-500 break-all">{visitor.qrCode}</p>
                </div>
                <div className="lg:col-span-2">
                  {visitor.checkedIn ? (
                    <div>
                      <AdminBadge tone={adminStatusTone('checked_in')}>Check-in</AdminBadge>
                      <p className="mt-1 text-xs text-slate-500">{visitor.checkedInAt ? new Date(visitor.checkedInAt).toLocaleString('id-ID') : '-'}</p>
                    </div>
                  ) : (
                    <AdminBadge>Belum</AdminBadge>
                  )}
                </div>
                <div className="lg:col-span-2 flex justify-end items-center gap-2">
                  <Button asChild variant="outline" size="sm" className="rounded-full text-xs">
                    <Link href="/admin/check-in">Check-in</Link>
                  </Button>
                </div>
              </div>
            ))
          )}
        </AdminPanel>

        {totalPages > 1 ? (
          <div className="flex items-center justify-center gap-3">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={buildPageHref(p)}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${p === page ? 'bg-indigo-600 text-white' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
              >
                {p}
              </Link>
            ))}
          </div>
        ) : null}
    </AdminShell>
  )
}
