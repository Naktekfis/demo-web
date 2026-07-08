import { type SupabaseClient } from '@supabase/supabase-js'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'expired' | 'cancelled'

export type PaymentSummary = {
  id: string
  registration_id: string
  provider: 'mock' | 'midtrans' | string
  status: PaymentStatus | string
  amount: number
  currency: string
  paid_at: string | null
  expired_at: string | null
  created_at: string
  updated_at: string
}

export async function getLatestPaymentsByRegistrationIds(supabase: SupabaseClient, registrationIds: string[]) {
  const uniqueIds = Array.from(new Set(registrationIds.filter(Boolean)))
  const paymentsByRegistrationId = new Map<string, PaymentSummary>()

  if (uniqueIds.length === 0) return paymentsByRegistrationId

  const { data, error } = await supabase
    .from('payments')
    .select('id, registration_id, provider, status, amount, currency, paid_at, expired_at, created_at, updated_at')
    .in('registration_id', uniqueIds)
    .order('created_at', { ascending: false })

  if (error) return paymentsByRegistrationId

  for (const payment of (data || []) as PaymentSummary[]) {
    if (!paymentsByRegistrationId.has(payment.registration_id)) {
      paymentsByRegistrationId.set(payment.registration_id, payment)
    }
  }

  return paymentsByRegistrationId
}

export function getPaymentDisplayStatus(payment: PaymentSummary | undefined) {
  return payment?.status || 'unpaid'
}
