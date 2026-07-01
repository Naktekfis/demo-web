import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

import { getNearestCheckinVenue } from '@/lib/geofence'
import { isAdminEmail } from '@/lib/admin'

type Payload = {
  ticketCode?: string
  lat?: number
  lng?: number
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(request: NextRequest) {
  if (!url || !anonKey || !serviceKey) {
    return NextResponse.json({ error: 'Supabase belum lengkap' }, { status: 500 })
  }

  const authHeader = request.headers.get('authorization')
  const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const authClient = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data, error: userError } = await authClient.auth.getUser(accessToken)
  if (userError || !isAdminEmail(data.user?.email)) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }

  const payload = (await request.json()) as Payload
  const ticketCode = payload.ticketCode?.trim()
  const lat = Number(payload.lat)
  const lng = Number(payload.lng)
  if (!ticketCode || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: 'ticketCode, lat, lng wajib diisi' }, { status: 400 })
  }

  const venue = getNearestCheckinVenue(lat, lng)
  if (!venue || venue.distanceMeters > venue.radiusMeters) {
    return NextResponse.json(
      { error: 'Lokasi staff di luar geofence check-in', venue },
      { status: 400 },
    )
  }

  const service = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data: ticket, error: ticketError } = await service
    .from('rsvp')
    .select('id, user_id, checked_in, checked_in_at')
    .eq('qr_code', ticketCode)
    .maybeSingle()

  if (ticketError) return NextResponse.json({ error: ticketError.message }, { status: 500 })
  if (!ticket) return NextResponse.json({ error: 'Tiket tidak ditemukan' }, { status: 404 })
  if (ticket.checked_in) {
    return NextResponse.json({ error: `Tiket sudah check-in pada ${ticket.checked_in_at || 'sebelumnya'}` }, { status: 409 })
  }

  const { error: updateError } = await service
    .from('rsvp')
    .update({ checked_in: true, checked_in_at: new Date().toISOString() })
    .eq('id', ticket.id)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  return NextResponse.json({ success: true, venue })
}
