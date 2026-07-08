import Link from 'next/link'
import { redirect } from 'next/navigation'

import { updateRegistrationStatus } from '@/app/admin/registrations/actions'
import { Button } from '@/components/ui/button'
import { isAdminUser } from '@/lib/admin'
import { listAdminRegistrations } from '@/lib/admin-registrations'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

type Props = {
  searchParams?: Record<string, string | string[] | undefined>
}

function param(searchParams: Props['searchParams'], key: string) {
  const value = searchParams?.[key]
  return Array.isArray(value) ? value[0] : value || ''
}

function buildExportHref(searchParams: Props['searchParams']) {
  const params = new URLSearchParams()
  for (const key of ['q', 'competitionSlug', 'registrationType', 'status', 'paymentStatus', 'checkInStatus']) {
    const value = param(searchParams, key)
    if (value) params.set(key, value)
  }
  const query = params.toString()
  return `/api/admin/registrations/export${query ? `?${query}` : ''}`
}

export default async function AdminRegistrationsPage({ searchParams }: Props) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?next=/admin/registrations')
  if (!(await isAdminUser(user))) redirect('/dashboard')

  let data = { items: [], page: 1, pageSize: 25, total: 0 } as Awaited<ReturnType<typeof listAdminRegistrations>>
  let error = ''

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    error = 'Konfigurasi server admin belum lengkap.'
  } else {
    try {
      data = await listAdminRegistrations(
        createServiceClient(),
        {
          q: param(searchParams, 'q') || undefined,
          competitionSlug: param(searchParams, 'competitionSlug') || undefined,
          registrationType: param(searchParams, 'registrationType') || undefined,
          status: param(searchParams, 'status') || undefined,
          paymentStatus: param(searchParams, 'paymentStatus') || undefined,
          checkInStatus: param(searchParams, 'checkInStatus') || undefined,
        },
        { page: param(searchParams, 'page') || undefined, pageSize: param(searchParams, 'pageSize') || undefined },
      )
    } catch {
      error = 'Gagal memuat daftar registrasi.'
    }
  }

  const competitionOptions = Array.from(new Map(data.items.map((item) => [item.competitionSlug, item.competitionName])).entries())

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 sm:px-10 lg:px-12">
      <section className="mx-auto w-full max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">Admin</p>
            <h1 className="mt-2 text-4xl font-bold text-slate-900">Review Registrasi</h1>
            <p className="mt-2 text-slate-600">Cari, filter, verifikasi, tolak, dan ekspor registrasi kompetisi MVP.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="rounded-full"><Link href="/admin">Overview</Link></Button>
            <Button asChild variant="outline" className="rounded-full"><Link href={buildExportHref(searchParams)}>Export CSV</Link></Button>
          </div>
        </div>

        <form className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-7">
          <input name="q" defaultValue={param(searchParams, 'q')} placeholder="Cari nama, email, UID, QR..." className="rounded-lg border border-slate-300 px-3 py-2 text-sm lg:col-span-2" />
          <select name="competitionSlug" defaultValue={param(searchParams, 'competitionSlug')} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="">Semua kompetisi</option>
            {competitionOptions.map(([slug, name]) => <option key={slug} value={slug}>{name}</option>)}
          </select>
          <select name="registrationType" defaultValue={param(searchParams, 'registrationType')} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="">Semua tipe</option>
            <option value="individual">Individual</option>
            <option value="team">Team</option>
          </select>
          <select name="status" defaultValue={param(searchParams, 'status')} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="">Semua status</option>
            <option value="submitted">Submitted</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
          <select name="paymentStatus" defaultValue={param(searchParams, 'paymentStatus')} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="">Semua pembayaran</option>
            <option value="unpaid">Belum dibuat</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select name="checkInStatus" defaultValue={param(searchParams, 'checkInStatus')} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="">Semua check-in</option>
            <option value="checked_in">Sudah check-in</option>
            <option value="not_checked_in">Belum check-in</option>
          </select>
          <Button type="submit" className="rounded-full bg-indigo-600 hover:bg-indigo-700 lg:col-start-7">Terapkan</Button>
        </form>

        {error ? <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800">{error}</div> : null}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-600">{data.total} registrasi ditemukan</div>
          {data.items.length === 0 ? (
            <div className="p-8 text-center text-slate-500">Tidak ada registrasi yang cocok.</div>
          ) : (
            data.items.map((registration) => (
              <div key={registration.id} className="grid gap-4 border-b border-slate-100 px-5 py-5 last:border-0 lg:grid-cols-12">
                <div className="lg:col-span-3">
                  <p className="font-semibold text-slate-900">{registration.competitionName}</p>
                  <p className="mt-1 text-sm capitalize text-slate-500">{registration.registrationKind}</p>
                </div>
                <div className="lg:col-span-3">
                  <p className="font-semibold text-slate-900">{registration.teamName || registration.primaryContact.name}</p>
                  <p className="mt-1 font-mono text-xs text-slate-500">{registration.teamUid || '-'}</p>
                </div>
                <div className="lg:col-span-2">
                  <p className="text-sm font-medium text-slate-900">{registration.primaryContact.email}</p>
                  <p className="mt-1 text-sm text-slate-500">{registration.primaryContact.phone}</p>
                </div>
                <div className="lg:col-span-1 space-y-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">{registration.status}</span>
                  <p className="text-xs capitalize text-slate-500">Pay: {registration.paymentStatus === 'unpaid' ? 'belum dibuat' : registration.paymentStatus}</p>
                  {registration.payment ? (
                    <p className="text-xs text-slate-500">
                      {registration.payment.provider} · {registration.payment.currency} {registration.payment.amount.toLocaleString('id-ID')}
                    </p>
                  ) : null}
                </div>
                <div className="lg:col-span-3">
                  <form action={updateRegistrationStatus} className="flex flex-wrap justify-end gap-2">
                    <input type="hidden" name="id" value={registration.id} />
                    <input name="note" placeholder="Catatan jika reject" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" />
                    {['submitted', 'verified', 'rejected'].map((status) => (
                      <button key={status} name="status" value={status} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40" disabled={registration.status === status}>
                        {status}
                      </button>
                    ))}
                    <Link href={`/admin/registrations/${registration.id}`} className="rounded-full border border-indigo-200 px-3 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-50">Detail</Link>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  )
}
