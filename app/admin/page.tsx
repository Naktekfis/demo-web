import Link from 'next/link'
import { redirect } from 'next/navigation'

import { AdminBadge, AdminPageHeader, AdminPanel, AdminShell, AdminStatCard, adminStatusTone } from '@/components/admin/admin-chrome'
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
    submittedRegistrations: 0,
    verifiedRegistrations: 0,
    rejectedRegistrations: 0,
    pendingPayments: 0,
    paidPayments: 0,
    perCompetition: [] as Array<{ competitionSlug: string; competitionName: string; count: number }>,
    recentRegistrations: [] as Awaited<ReturnType<typeof listAdminRegistrations>>['items'],
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
        submittedRegistrations: registrationsPage.items.filter((registration) => registration.status === 'submitted').length,
        verifiedRegistrations: registrationsPage.items.filter((registration) => registration.status === 'verified').length,
        rejectedRegistrations: registrationsPage.items.filter((registration) => registration.status === 'rejected').length,
        pendingPayments: registrationsPage.items.filter((registration) => registration.paymentStatus === 'pending').length,
        paidPayments: registrationsPage.items.filter((registration) => registration.paymentStatus === 'paid').length,
        recentRegistrations: registrationsPage.items.slice(0, 5),
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
    <AdminShell maxWidth="max-w-6xl">
      <AdminPageHeader
        title="Admin Overview"
        description="Ringkasan operasional registrasi kompetisi, pembayaran, dan tiket pengunjung dalam satu command center."
        activeHref="/admin"
        actions={(
          <Button asChild variant="outline" className="rounded-full bg-white/80">
            <Link href="/dashboard">Ke dashboard</Link>
          </Button>
        )}
      />

        {error ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 font-medium text-amber-800">{error}</div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ['Visitors', metrics.totalVisitors, 'sky', 'Tiket QR terbit'],
            ['Check-in', metrics.totalCheckedInVisitors, 'green', 'Sudah hadir di venue'],
            ['Registrasi', metrics.totalRegistrations, 'indigo', 'Individual dan tim'],
            ['Tim', metrics.totalTeams, 'slate', 'Tim yang dibuat'],
            ['Submitted', metrics.submittedRegistrations, 'amber', 'Menunggu review'],
            ['Verified', metrics.verifiedRegistrations, 'green', 'Diterima admin'],
            ['Rejected', metrics.rejectedRegistrations, 'rose', 'Ditolak admin'],
            ['Payment pending', metrics.pendingPayments, 'amber', 'Menunggu pembayaran'],
            ['Payment paid', metrics.paidPayments, 'green', 'Pembayaran sukses'],
          ].map(([label, value, tone, helper]) => (
            <AdminStatCard key={label} label={String(label)} value={value} tone={tone as Parameters<typeof AdminStatCard>[0]['tone']} helper={String(helper)} />
          ))}
        </div>

        <AdminPanel
          title="Registrasi terbaru"
          action={(
            <Link href="/admin/registrations" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
              Lihat semua
            </Link>
          )}
        >
          {metrics.recentRegistrations.length === 0 ? (
            <div className="p-8 text-center text-slate-500">Belum ada registrasi.</div>
          ) : (
            metrics.recentRegistrations.map((registration) => (
              <div key={registration.id} className="grid gap-3 border-b border-slate-100 px-5 py-4 last:border-0 md:grid-cols-12 md:items-center">
                <div className="md:col-span-4">
                  <p className="font-semibold text-slate-900">{registration.competitionName}</p>
                  <p className="text-sm capitalize text-slate-500">{registration.registrationKind}</p>
                </div>
                <div className="md:col-span-4">
                  <p className="font-semibold text-slate-900">{registration.teamName || registration.primaryContact.name}</p>
                  <p className="text-sm text-slate-500">{registration.primaryContact.email}</p>
                </div>
                <div className="flex items-center gap-2 md:col-span-2">
                  <AdminBadge tone={adminStatusTone(registration.status)}>{registration.status}</AdminBadge>
                </div>
                <div className="md:col-span-2 md:text-right">
                  <Link href={`/admin/registrations/${registration.id}`} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                    Detail
                  </Link>
                </div>
              </div>
            ))
          )}
        </AdminPanel>

        <AdminPanel title="Registrasi per kompetisi">
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
        </AdminPanel>
    </AdminShell>
  )
}
