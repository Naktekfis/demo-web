import { redirect } from 'next/navigation'

import { AdminPageHeader, AdminShell } from '@/components/admin/admin-chrome'
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
    <AdminShell maxWidth="max-w-3xl">
        <AdminPageHeader
          title="Check-in Venue"
          description="Scan atau paste token QR tiket pengunjung. Check-in tetap admin-only dan tidak membutuhkan geofence untuk MVP."
          activeHref="/admin/check-in"
        />
        <CheckInForm />
    </AdminShell>
  )
}
