import { randomBytes } from 'crypto'

import { type SupabaseClient } from '@supabase/supabase-js'

import { createServiceClient } from '@/lib/supabase/server'

export type VisitorTicket = {
  id: string
  user_id: string
  qr_code: string
  checked_in: boolean
  checked_in_at: string | null
  checked_in_by?: string | null
}

export function generateQrToken() {
  return randomBytes(32).toString('hex')
}

export async function ensureVisitorTicket(userId: string, client?: SupabaseClient) {
  const supabase = client || createServiceClient()

  const { data: existingTicket, error: selectError } = await supabase
    .from('visitor_tickets')
    .select('id, user_id, qr_code, checked_in, checked_in_at, checked_in_by')
    .eq('user_id', userId)
    .maybeSingle()

  if (selectError) {
    return { ok: false as const, error: selectError }
  }

  if (existingTicket) {
    return { ok: true as const, ticket: existingTicket as VisitorTicket }
  }

  const { data: createdTicket, error: insertError } = await supabase
    .from('visitor_tickets')
    .insert({ user_id: userId, qr_code: generateQrToken() })
    .select('id, user_id, qr_code, checked_in, checked_in_at, checked_in_by')
    .single()

  if (!insertError && createdTicket) {
    return { ok: true as const, ticket: createdTicket as VisitorTicket }
  }

  const { data: racedTicket, error: racedSelectError } = await supabase
    .from('visitor_tickets')
    .select('id, user_id, qr_code, checked_in, checked_in_at, checked_in_by')
    .eq('user_id', userId)
    .maybeSingle()

  if (racedSelectError || !racedTicket) {
    return { ok: false as const, error: insertError || racedSelectError }
  }

  return { ok: true as const, ticket: racedTicket as VisitorTicket }
}
