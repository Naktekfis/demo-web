import { type NextRequest } from 'next/server'

import { apiError, apiSuccess } from '@/lib/api-response'
import { getAdminUser } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase/server'

const allowedStatuses = ['pending', 'verified', 'rejected'] as const

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminUser(request)
  if (!admin.ok) return apiError(admin.code, admin.message, admin.status)

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return apiError('SERVER_CONFIG_MISSING', 'Konfigurasi server admin belum lengkap.', 500)
  }

  let body: { status?: string; note?: string }
  try {
    body = (await request.json()) as { status?: string; note?: string }
  } catch {
    return apiError('INVALID_JSON', 'Format request tidak valid.', 400)
  }

  const status = body.status
  const note = body.note?.trim() || null

  if (!status || !allowedStatuses.includes(status as (typeof allowedStatuses)[number])) {
    return apiError('INVALID_STATUS', 'Status registrasi tidak valid.', 400)
  }

  if (status === 'rejected' && !note) {
    return apiError('NOTE_REQUIRED', 'Catatan wajib diisi saat menolak registrasi.', 400)
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('competition_registrations')
    .update({ status, note })
    .eq('id', params.id)
    .select('id, status, note')
    .maybeSingle()

  if (error) return apiError('REGISTRATION_STATUS_UPDATE_FAILED', 'Gagal mengubah status registrasi.', 500)
  if (!data) return apiError('REGISTRATION_NOT_FOUND', 'Registrasi tidak ditemukan.', 404)

  return apiSuccess({ registration: data })
}
