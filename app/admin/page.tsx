import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { isAdminUser } from '@/lib/admin'
import { listAdminRegistrations } from '@/lib/admin-registrations'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?next=/admin')

  if (!(await isAdminUser(user))) redirect('/dashboard')

  let metrics = {
    totalVisitors: 0,
    totalCheckedInVisitors: 0,
    totalRegistrations: 0,
    totalTeams: 0,
    pendingRegistrations: 0,
    verifiedRegistrations: 0,
    rejectedRegistrations: 0,
    perCompetition: [] as Array<{ competitionSlug: string; competitionName: string; count: number }>,
  }
  let error = ''

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    error = 'Konfigurasi server admin belum lengkap.'
  } else {
    try {
      const service = createServiceClient()
      const [ticketsResult, teamsResult, registrationsPage] = await Promise.all([
        service.from('visitor_tickets').select('id, checked_in'),
        service.from('competition_teams').select('id'),
        listAdminRegistrations(service, {}, { page: 1, pageSize: 1000 }),
      ])

      if (ticketsResult.error) throw ticketsResult.error
      if (teamsResult.error) throw teamsResult.error

      metrics = {
        totalVisitors: ticketsResult.data?.length || 0,
        totalCheckedInVisitors: (ticketsResult.data || []).filter((ticket) => ticket.checked_in).length,
        totalRegistrations: registrationsPage.total,
        totalTeams: teamsResult.data?.length || 0,
        pendingRegistrations: registrationsPage.items.filter((registration) => registration.status === 'pending').length,
        verifiedRegistrations: registrationsPage.items.filter((registration) => registration.status === 'verified').length,
        rejectedRegistrations: registrationsPage.items.filter((registration) => registration.status === 'rejected').length,
        perCompetition: Object.values(
          registrationsPage.items.reduce<Record<string, { competitionSlug: string; competitionName: string; count: number }>>((acc, registration) => {
            acc[registration.competitionSlug] ||= {
              competitionSlug: registration.competitionSlug,
              competitionName: registration.competitionName,
              count: 0,
            }
            acc[registration.competitionSlug].count += 1
            return acc
          }, {}),
        ),
      }
    } catch {
      error = 'Gagal memuat ringkasan admin.'
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 sm:px-10 lg:px-12">
      <section className="mx-auto w-full max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">Admin</p>
            <h1 className="mt-2 text-4xl font-bold text-slate-900">Admin Overview</h1>
            <p className="mt-2 text-slate-600">Ringkasan operasional registrasi kompetisi dan tiket pengunjung.</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/admin/registrations">Registrasi</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/admin/check-in">Check-in</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/dashboard">Ke dashboard</Link>
            </Button>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800">{error}</div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ['Total visitors', metrics.totalVisitors],
            ['Visitors checked-in', metrics.totalCheckedInVisitors],
            ['Registrasi', metrics.totalRegistrations],
            ['Tim dibuat', metrics.totalTeams],
            ['Pending', metrics.pendingRegistrations],
            ['Verified', metrics.verifiedRegistrations],
            ['Rejected', metrics.rejectedRegistrations],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-600">
            Registrasi per kompetisi
          </div>
          {metrics.perCompetition.length === 0 ? (
            <div className="p-8 text-center text-slate-500">Belum ada registrasi.</div>
          ) : (
            metrics.perCompetition.map((competition) => (
              <div key={competition.competitionSlug} className="flex items-center justify-between border-b border-slate-100 px-5 py-4 last:border-0">
                <div>
                  <p className="font-semibold text-slate-900">{competition.competitionName}</p>
                  <p className="font-mono text-xs text-slate-500">{competition.competitionSlug}</p>
                </div>
                <p className="text-2xl font-bold text-slate-900">{competition.count}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  )
}
