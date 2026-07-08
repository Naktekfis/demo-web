import { type NextRequest } from 'next/server'

import { apiError, apiSuccess, unauthorizedResponse, type ApiErrorCode } from '@/lib/api-response'
import { getAuthenticatedUser } from '@/lib/auth'
import {
  getAuthorizedPaymentRegistration,
  getRegistrationPaymentAmount,
  type PaymentSummary,
} from '@/lib/payments'
import { createServiceClient } from '@/lib/supabase/server'

type CreatePaymentPayload = {
  registrationId?: string
  provider?: string
}

function paymentResponse(payment: PaymentSummary) {
  return {
    payment,
    redirectUrl: `/dashboard/payments/${payment.id}/mock`,
  }
}

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUser(request)

  if (!auth.ok) return unauthorizedResponse()

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return apiError('SERVER_CONFIG_MISSING', 'Konfigurasi server pembayaran belum lengkap.', 500)
  }

  let payload: CreatePaymentPayload

  try {
    payload = (await request.json()) as CreatePaymentPayload
  } catch {
    return apiError('INVALID_JSON', 'Format request tidak valid.', 400)
  }

  const registrationId = payload.registrationId?.trim()
  const provider = payload.provider?.trim() || 'mock'

  if (!registrationId) return apiError('REGISTRATION_REQUIRED', 'Registrasi wajib dipilih.', 400)
  if (provider !== 'mock') return apiError('PAYMENT_PROVIDER_UNAVAILABLE', 'Provider pembayaran belum tersedia.', 400)

  const supabase = createServiceClient()
  const authorized = await getAuthorizedPaymentRegistration(supabase, registrationId, auth.user.id)

  if (!authorized.ok) return apiError(authorized.code as ApiErrorCode, authorized.message, authorized.status)

  if (authorized.registration.status === 'verified' || authorized.registration.status === 'rejected') {
    return apiError('REGISTRATION_NOT_PAYABLE', 'Registrasi ini tidak dapat dibayar.', 409)
  }

  if (authorized.registration.status !== 'submitted') {
    return apiError('REGISTRATION_NOT_SUBMITTED', 'Registrasi harus dikirim sebelum pembayaran dibuat.', 409)
  }

  const { data: pendingPayment, error: pendingError } = await supabase
    .from('payments')
    .select('id, registration_id, provider, status, amount, currency, paid_at, expired_at, created_at, updated_at')
    .eq('registration_id', registrationId)
    .eq('status', 'pending')
    .maybeSingle()

  if (pendingError) return apiError('PAYMENT_LOOKUP_FAILED', 'Gagal memeriksa pembayaran aktif.', 500)
  if (pendingPayment) return apiSuccess(paymentResponse(pendingPayment as PaymentSummary))

  const amount = await getRegistrationPaymentAmount(authorized.registration.competitionSlug)
  const { data: payment, error: insertError } = await supabase
    .from('payments')
    .insert({
      registration_id: registrationId,
      provider: 'mock',
      status: 'pending',
      amount,
      currency: 'IDR',
    })
    .select('id, registration_id, provider, status, amount, currency, paid_at, expired_at, created_at, updated_at')
    .single()

  if (insertError || !payment) {
    if (insertError?.code === '23505') {
      const { data: racedPayment } = await supabase
        .from('payments')
        .select('id, registration_id, provider, status, amount, currency, paid_at, expired_at, created_at, updated_at')
        .eq('registration_id', registrationId)
        .eq('status', 'pending')
        .maybeSingle()

      if (racedPayment) return apiSuccess(paymentResponse(racedPayment as PaymentSummary))
    }

    return apiError('PAYMENT_CREATE_FAILED', 'Gagal membuat pembayaran.', 500)
  }

  return apiSuccess(paymentResponse(payment as PaymentSummary), 201)
}
