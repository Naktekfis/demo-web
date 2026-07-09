import { type NextRequest } from 'next/server'

import { apiSuccess } from '@/lib/api-response'
import { getAuthenticatedUser } from '@/lib/auth'
import { isAdminUser } from '@/lib/admin'

export async function GET(request: NextRequest) {
  const auth = await getAuthenticatedUser(request)

  if (!auth.ok) {
    return apiSuccess({ isAdmin: false })
  }

  return apiSuccess({ isAdmin: await isAdminUser(auth.user) })
}
