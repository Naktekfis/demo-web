import { createClient as createSupabaseClient, type User } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'

import { createClient } from '@/lib/supabase/server'

type AuthenticatedUserResult =
  | { ok: true; user: User }
  | { ok: false; code: 'UNAUTHORIZED'; message: string; status: 401 }

export async function getAuthenticatedUser(request?: NextRequest): Promise<AuthenticatedUserResult> {
  const authHeader = request?.headers.get('authorization')
  const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (accessToken && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        global: { headers: { Authorization: `Bearer ${accessToken}` } },
        auth: { persistSession: false, autoRefreshToken: false },
      },
    )
    const { data, error } = await supabase.auth.getUser(accessToken)

    if (!error && data.user) {
      return { ok: true, user: data.user }
    }
  }

  const supabase = createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    return { ok: false, code: 'UNAUTHORIZED', message: 'Silakan masuk terlebih dahulu.', status: 401 }
  }

  return { ok: true, user: data.user }
}
