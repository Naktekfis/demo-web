import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { isAdminEmail } from '@/lib/admin'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

type Registration = {
  id: string
  competition_id: string
  team_name: string
  team_members: Array<{ name?: string; email?: string; role?: string }>
  status: string
  created_at?: string
}

async function updateRegistrationStatus(formData: FormData) {
  'use server'

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!isAdminEmail(user?.email)) return

  const id = String(formData.get('id') || '')
  const status = String(formData.get('status') || '')
  if (!id || !['verified', 'rejected', 'pending'].includes(status)) return

  await createServiceClient().from('registrations').update({ status }).eq('id', id)
  revalidatePath('/admin')
}

export default async function AdminPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?next=/admin')

  if (!isAdminEmail(user.email)) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16 sm:px-10 lg:px-12">
        <section className="mx-auto max-w-3xl rounded-2xl border border-rose-200 bg-white p-8">
          <h1 className="text-2xl font-bold text-slate-900">Admin tidak aktif</h1>
          <p className="mt-3 text-slate-600">Tambahkan email ini ke env ADMIN_EMAILS untuk akses admin.</p>
          <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 font-mono text-sm text-slate-700">{user.email}</p>
        </section>
      </main>
    )
  }

  let registrations: Registration[] = []
  let error = ''
  try {
    const { data, error: queryError } = await createServiceClient()
      .from('registrations')
      .select('id, competition_id, team_name, team_members, status, created_at')
      .order('created_at', { ascending: false })

    if (queryError) error = queryError.message
    registrations = (data || []) as Registration[]
  } catch {
    error = 'SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi.'
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 sm:px-10 lg:px-12">
      <section className="mx-auto w-full max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">Admin</p>
            <h1 className="mt-2 text-4xl font-bold text-slate-900">Registrasi Kompetisi</h1>
            <p className="mt-2 text-slate-600">Verify/reject registrasi. Minimal dulu, tanpa role table.</p>
          </div>
          <div className="flex gap-2">
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

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="grid grid-cols-12 gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-600">
            <span className="col-span-4">Tim</span>
            <span className="col-span-3">Kompetisi</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-3 text-right">Aksi</span>
          </div>

          {registrations.length === 0 ? (
            <div className="p-8 text-center text-slate-500">Belum ada registrasi.</div>
          ) : (
            registrations.map((registration) => (
              <div key={registration.id} className="grid grid-cols-12 gap-4 border-b border-slate-100 px-5 py-4 last:border-0">
                <div className="col-span-4">
                  <p className="font-semibold text-slate-900">{registration.team_name}</p>
                  <p className="mt-1 text-sm text-slate-500">{registration.team_members?.length || 0} anggota</p>
                </div>
                <p className="col-span-3 text-sm text-slate-600">{registration.competition_id}</p>
                <p className="col-span-2 text-sm font-medium capitalize text-slate-700">{registration.status}</p>
                <div className="col-span-3 flex justify-end gap-2">
                  {['verified', 'rejected', 'pending'].map((status) => (
                    <form key={status} action={updateRegistrationStatus}>
                      <input type="hidden" name="id" value={registration.id} />
                      <input type="hidden" name="status" value={status} />
                      <button
                        type="submit"
                        className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                        disabled={registration.status === status}
                      >
                        {status}
                      </button>
                    </form>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  )
}
