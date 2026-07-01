import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { CheckInForm } from '@/components/admin/check-in-form'
import { isAdminEmail } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AdminCheckInPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?next=/admin/check-in')

  if (!isAdminEmail(user.email)) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16 sm:px-10 lg:px-12">
        <section className="mx-auto max-w-3xl rounded-2xl border border-rose-200 bg-white p-8">
          <h1 className="text-2xl font-bold text-slate-900">Admin tidak aktif</h1>
          <p className="mt-3 text-slate-600">Tambahkan email ini ke env ADMIN_EMAILS untuk akses check-in.</p>
          <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 font-mono text-sm text-slate-700">{user.email}</p>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 sm:px-10 lg:px-12">
      <section className="mx-auto w-full max-w-3xl space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">Admin</p>
            <h1 className="mt-2 text-4xl font-bold text-slate-900">Check-in Venue</h1>
          </div>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/admin">Registrasi</Link>
          </Button>
        </div>
        <CheckInForm />
      </section>
    </main>
  )
}
