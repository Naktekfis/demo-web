import { type NextRequest } from 'next/server'

import { apiError, apiSuccess } from '@/lib/api-response'
import { getAdminUser } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase/server'

type Payload = {
  qrCode?: string
}

export async function POST(request: NextRequest) {
  const admin = await getAdminUser(request)
  if (!admin.ok) return apiError(admin.code, admin.message, admin.status)

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return apiError('SERVER_CONFIG_MISSING', 'Konfigurasi server admin belum lengkap.', 500)
  }

  try {
    const payload = (await request.json()) as Payload
    const qrCode = payload.qrCode?.trim()
    if (!qrCode) {
      return apiError('MISSING_QR_CODE', 'QR code wajib diisi.', 400)
    }

    const supabase = createServiceClient()

    const { data: ticket, error: ticketError } = await supabase
      .from('visitor_tickets')
      .select('id, user_id, qr_code, checked_in, checked_in_at, checked_in_by')
      .eq('qr_code', qrCode)
      .maybeSingle()

    if (ticketError) throw ticketError
    if (!ticket) {
      return apiError('TICKET_NOT_FOUND', 'Tiket tidak ditemukan.', 404)
    }
    if (ticket.checked_in) {
      return apiError(
        'ALREADY_CHECKED_IN',
        `Tiket sudah check-in pada ${ticket.checked_in_at ? new Date(ticket.checked_in_at).toLocaleString('id-ID') : 'sebelumnya'}.`,
        409,
      )
    }

    const now = new Date().toISOString()
    const { data: updated, error: updateError } = await supabase
      .from('visitor_tickets')
      .update({ checked_in: true, checked_in_at: now, checked_in_by: admin.user.id })
      .eq('id', ticket.id)
      .eq('checked_in', false)
      .select('id')
      .maybeSingle()

    if (updateError) throw updateError
    if (!updated) {
      return apiError('ALREADY_CHECKED_IN', 'Tiket sudah check-in sebelumnya.', 409)
    }

    return apiSuccess({ qrCode: ticket.qr_code, checkedInAt: now })
  } catch {
    return apiError('CHECKIN_FAILED', 'Gagal memproses check-in.', 500)
  }
}
