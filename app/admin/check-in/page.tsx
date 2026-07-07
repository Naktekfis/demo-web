import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { CheckInForm } from '@/components/admin/check-in-form'
import { isAdminUser } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AdminCheckInPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?next=/admin/check-in')

  if (!(await isAdminUser(user))) redirect('/dashboard')

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 sm:px-10 lg:px-12">
      <section className="mx-auto w-full max-w-3xl space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">Admin</p>
            <h1 className="mt-2 text-4xl font-bold text-slate-900">Check-in Venue</h1>
          </div>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/admin">Overview</Link>
          </Button>
        </div>
        <CheckInForm />
      </section>
    </main>
  )
}
