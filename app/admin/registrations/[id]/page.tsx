import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { updateRegistrationStatus } from '@/app/admin/registrations/actions'
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
    <main className="min-h-screen bg-slate-50 px-6 py-12 sm:px-10 lg:px-12">
      <section className="mx-auto w-full max-w-5xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">Detail Registrasi</p>
            <h1 className="mt-2 text-4xl font-bold text-slate-900">{registration.competitionName}</h1>
            <p className="mt-2 text-slate-600">Submitted: {new Date(registration.submittedAt).toLocaleString('id-ID')}</p>
          </div>
          <Button asChild variant="outline" className="rounded-full"><Link href="/admin/registrations">Kembali</Link></Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[['Tipe', registration.registrationKind], ['Status', registration.status], ['Check-in', registration.checkedIn ? 'Sudah' : 'Belum']].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-xl font-bold capitalize text-slate-900">{value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold text-slate-900">Status Review</h2>
          {registration.note ? <p className="mt-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{registration.note}</p> : null}
          <form action={updateRegistrationStatus} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
            <input type="hidden" name="id" value={registration.id} />
            <input name="note" defaultValue={registration.note} placeholder="Catatan wajib untuk rejected" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            {['pending', 'verified', 'rejected'].map((status) => (
              <button key={status} name="status" value={status} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40" disabled={registration.status === status}>
                {status}
              </button>
            ))}
          </form>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold text-slate-900">Tim / Kontak Utama</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div><dt className="text-sm text-slate-500">Nama tim</dt><dd className="font-semibold text-slate-900">{registration.teamName || '-'}</dd></div>
            <div><dt className="text-sm text-slate-500">Team UID</dt><dd className="font-mono font-semibold text-slate-900">{registration.teamUid || '-'}</dd></div>
            <div><dt className="text-sm text-slate-500">Kontak utama</dt><dd className="font-semibold text-slate-900">{registration.primaryContact.name}</dd></div>
            <div><dt className="text-sm text-slate-500">Email</dt><dd className="font-semibold text-slate-900">{registration.primaryContact.email}</dd></div>
          </dl>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-3 font-semibold text-slate-700">Anggota / Peserta</div>
          {registration.members.map((member) => (
            <div key={`${member.userId}-${member.role}`} className="grid gap-4 border-b border-slate-100 px-5 py-4 last:border-0 md:grid-cols-5">
              <div><p className="font-semibold text-slate-900">{member.name}</p><p className="text-xs capitalize text-slate-500">{member.role}</p></div>
              <p className="text-sm text-slate-600">{member.email}</p>
              <p className="text-sm text-slate-600">{member.phone}</p>
              <p className="text-sm text-slate-600">{member.institution}</p>
              <p className="text-sm text-slate-600">{member.checkedIn ? `Check-in ${member.checkedInAt || ''}` : 'Belum check-in'}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
