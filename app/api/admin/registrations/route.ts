import { type NextRequest } from 'next/server'

import { apiError, apiSuccess } from '@/lib/api-response'
import { getAdminUser } from '@/lib/admin'
import { listAdminRegistrations } from '@/lib/admin-registrations'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const admin = await getAdminUser(request)
  if (!admin.ok) return apiError(admin.code, admin.message, admin.status)

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return apiError('SERVER_CONFIG_MISSING', 'Konfigurasi server admin belum lengkap.', 500)
  }

  const params = new URL(request.url).searchParams

  try {
    const page = await listAdminRegistrations(
      createServiceClient(),
      {
        q: params.get('q') || undefined,
        competitionSlug: params.get('competitionSlug') || undefined,
        registrationType: params.get('registrationType') || undefined,
        status: params.get('status') || undefined,
        paymentStatus: params.get('paymentStatus') || undefined,
        checkInStatus: params.get('checkInStatus') || undefined,
      },
      { page: params.get('page') || undefined, pageSize: params.get('pageSize') || undefined },
    )

    return apiSuccess(page)
  } catch {
    return apiError('ADMIN_REGISTRATIONS_FAILED', 'Gagal memuat daftar registrasi.', 500)
  }
}
