import { type User } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'

import { getAuthenticatedUser } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/server'

export function isAdminEmail(email?: string | null) {
  return Boolean(
    email &&
      (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map((value) => value.trim().toLowerCase())
        .includes(email.toLowerCase()),
  )
}

export async function isAdminUser(user: Pick<User, 'id' | 'email'>) {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('admin_roles')
      .select('id')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle()

    if (!error && data) {
      return true
    }
  }

  return isAdminEmail(user.email)
}

type AdminUserResult =
  | { ok: true; user: User }
  | { ok: false; code: 'UNAUTHORIZED' | 'ADMIN_ONLY'; message: string; status: 401 | 403 }

export async function getAdminUser(request?: NextRequest): Promise<AdminUserResult> {
  const auth = await getAuthenticatedUser(request)

  if (!auth.ok) {
    return auth
  }

  if (!(await isAdminUser(auth.user))) {
    return { ok: false, code: 'ADMIN_ONLY', message: 'Akses hanya tersedia untuk admin.', status: 403 }
  }

  return auth
}
