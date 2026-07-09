import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { updateRegistrationStatus } from '@/app/admin/registrations/actions'
import { AdminBadge, AdminPageHeader, AdminPanel, AdminShell, AdminStatCard, adminStatusTone } from '@/components/admin/admin-chrome'
import { Button } from '@/components/ui/button'
import { isAdminUser } from '@/lib/admin'
import { getAdminRegistrationById } from '@/lib/admin-registrations'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AdminRegistrationDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(`/auth/login?next=/admin/registrations/${params.id}`)
  if (!(await isAdminUser(user))) redirect('/dashboard')
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) notFound()

  const registration = await getAdminRegistrationById(createServiceClient(), params.id)
  if (!registration) notFound()

  return (
    <AdminShell maxWidth="max-w-5xl">
        <AdminPageHeader
          title={registration.competitionName}
          description={`Submitted: ${new Date(registration.submittedAt).toLocaleString('id-ID')}`}
          activeHref="/admin/registrations"
          actions={<Button asChild variant="outline" className="rounded-full bg-white/80"><Link href="/admin/registrations">Kembali</Link></Button>}
        />

        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['Tipe', registration.registrationKind, 'slate'],
            ['Status', registration.status, adminStatusTone(registration.status)],
            ['Pembayaran', registration.paymentStatus === 'unpaid' ? 'Belum dibuat' : registration.paymentStatus, adminStatusTone(registration.paymentStatus)],
            ['Check-in', registration.checkedIn ? 'Sudah' : 'Belum', registration.checkedIn ? 'green' : 'slate'],
          ].map(([label, value, tone]) => (
            <AdminStatCard key={label} label={String(label)} value={String(value)} tone={tone as Parameters<typeof AdminStatCard>[0]['tone']} />
          ))}
        </div>

        <AdminPanel title="Status Review">
          <div className="p-6">
          {registration.note ? <p className="mt-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{registration.note}</p> : null}
          <form action={updateRegistrationStatus} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
            <input type="hidden" name="id" value={registration.id} />
            <input name="note" defaultValue={registration.note} placeholder="Catatan wajib untuk rejected" className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
            {['submitted', 'verified', 'rejected'].map((status) => (
              <button key={status} name="status" value={status} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40" disabled={registration.status === status}>
                {status}
              </button>
            ))}
          </form>
          </div>
        </AdminPanel>

        <AdminPanel title="Pembayaran">
          <div className="p-6">
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div><dt className="text-sm text-slate-500">Status</dt><dd className="font-semibold capitalize text-slate-900">{registration.paymentStatus === 'unpaid' ? 'Belum dibuat' : registration.paymentStatus}</dd></div>
            <div><dt className="text-sm text-slate-500">Provider</dt><dd className="font-semibold text-slate-900">{registration.payment?.provider || '-'}</dd></div>
            <div><dt className="text-sm text-slate-500">Amount</dt><dd className="font-semibold text-slate-900">{registration.payment ? `${registration.payment.currency} ${registration.payment.amount.toLocaleString('id-ID')}` : '-'}</dd></div>
            <div><dt className="text-sm text-slate-500">Midtrans order ID</dt><dd className="font-mono text-sm font-semibold text-slate-900">{registration.midtransTransaction?.order_id || '-'}</dd></div>
            <div><dt className="text-sm text-slate-500">Paid at</dt><dd className="font-semibold text-slate-900">{registration.payment?.paid_at ? new Date(registration.payment.paid_at).toLocaleString('id-ID') : '-'}</dd></div>
            <div><dt className="text-sm text-slate-500">Expired at</dt><dd className="font-semibold text-slate-900">{registration.payment?.expired_at ? new Date(registration.payment.expired_at).toLocaleString('id-ID') : '-'}</dd></div>
            <div><dt className="text-sm text-slate-500">Latest attempt</dt><dd className="font-semibold text-slate-900">{registration.payment?.created_at ? new Date(registration.payment.created_at).toLocaleString('id-ID') : '-'}</dd></div>
            <div><dt className="text-sm text-slate-500">Midtrans transaction status</dt><dd className="font-semibold text-slate-900">{registration.midtransTransaction?.transaction_status || '-'}</dd></div>
            <div><dt className="text-sm text-slate-500">Midtrans fraud status</dt><dd className="font-semibold text-slate-900">{registration.midtransTransaction?.fraud_status || '-'}</dd></div>
          </dl>
          </div>
        </AdminPanel>

        <AdminPanel title="Tim / Kontak Utama">
          <div className="p-6">
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div><dt className="text-sm text-slate-500">Nama tim</dt><dd className="font-semibold text-slate-900">{registration.teamName || '-'}</dd></div>
            <div><dt className="text-sm text-slate-500">Team UID</dt><dd className="font-mono font-semibold text-slate-900">{registration.teamUid || '-'}</dd></div>
            <div><dt className="text-sm text-slate-500">Kontak utama</dt><dd className="font-semibold text-slate-900">{registration.primaryContact.name}</dd></div>
            <div><dt className="text-sm text-slate-500">Email</dt><dd className="font-semibold text-slate-900">{registration.primaryContact.email}</dd></div>
          </dl>
          </div>
        </AdminPanel>

        <AdminPanel title="Anggota / Peserta">
          {registration.members.map((member) => (
            <div key={`${member.userId}-${member.role}`} className="grid gap-4 border-b border-slate-100 px-5 py-4 last:border-0 md:grid-cols-5">
              <div><p className="font-semibold text-slate-900">{member.name}</p><p className="text-xs capitalize text-slate-500">{member.role}</p></div>
              <p className="text-sm text-slate-600">{member.email}</p>
              <p className="text-sm text-slate-600">{member.phone}</p>
              <p className="text-sm text-slate-600">{member.institution}</p>
              <p className="text-sm text-slate-600"><AdminBadge tone={member.checkedIn ? 'green' : 'slate'}>{member.checkedIn ? `Check-in ${member.checkedInAt || ''}` : 'Belum check-in'}</AdminBadge></p>
            </div>
          ))}
        </AdminPanel>
    </AdminShell>
  )
}
