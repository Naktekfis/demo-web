import { type NextRequest } from 'next/server'

import { apiError, apiSuccess, unauthorizedResponse } from '@/lib/api-response'
import { getAuthenticatedUser } from '@/lib/auth'
import { ensureVisitorTicket } from '@/lib/tickets'

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUser(request)

  if (!auth.ok) {
    return unauthorizedResponse()
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return apiError('SERVER_CONFIG_MISSING', 'Konfigurasi server tiket belum lengkap.', 500)
  }

  const result = await ensureVisitorTicket(auth.user.id)

  if (!result?.ok) {
    return apiError('TICKET_ENSURE_FAILED', 'Gagal menyiapkan tiket pengunjung.', 500)
  }

  return apiSuccess({ ticket: result.ticket })
}
