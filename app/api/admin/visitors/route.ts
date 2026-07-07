import { type NextRequest } from 'next/server'

import { apiError, apiSuccess } from '@/lib/api-response'
import { getAdminUser } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const admin = await getAdminUser(request)
  if (!admin.ok) return apiError(admin.code, admin.message, admin.status)

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return apiError('SERVER_CONFIG_MISSING', 'Konfigurasi server admin belum lengkap.', 500)
  }

  const qs = request.nextUrl.searchParams
  const q = qs.get('q') || ''
  const checkInStatus = qs.get('checkInStatus') || ''
  const page = Math.max(1, Number(qs.get('page')) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(qs.get('pageSize')) || 25))
  const offset = (page - 1) * pageSize

  try {
    const supabase = createServiceClient()

    let query = supabase
      .from('visitor_tickets')
      .select('id, user_id, qr_code, checked_in, checked_in_at, profiles!inner(id, full_name, email, phone, institution)', {
        count: 'exact',
      })

    const trimmedQ = q.trim()
    if (trimmedQ) {
      query = query.or(
        `qr_code.ilike.%${trimmedQ}%,profiles.full_name.ilike.%${trimmedQ}%,profiles.email.ilike.%${trimmedQ}%,profiles.phone.ilike.%${trimmedQ}%`,
      )
    }

    if (checkInStatus === 'checked_in') {
      query = query.eq('checked_in', true)
    } else if (checkInStatus === 'not_checked_in') {
      query = query.eq('checked_in', false)
    }

    const { data: tickets, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1)

    if (error) throw error

    const items = (tickets || []).map((ticket) => {
      const profile = Array.isArray(ticket.profiles) ? ticket.profiles[0] : ticket.profiles
      return {
        id: ticket.id,
        qrCode: ticket.qr_code,
        checkedIn: ticket.checked_in,
        checkedInAt: ticket.checked_in_at,
        name: profile?.full_name || '-',
        email: profile?.email || '-',
        phone: profile?.phone || '-',
        institution: profile?.institution || '-',
      }
    })

    return apiSuccess({ items, total: count || 0, page, pageSize })
  } catch {
    return apiError('ADMIN_VISITORS_FAILED', 'Gagal memuat daftar pengunjung.', 500)
  }
}
