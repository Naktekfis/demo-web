import { type NextRequest } from 'next/server'

import { apiError, apiSuccess, unauthorizedResponse, type ApiErrorCode } from '@/lib/api-response'
import { getAuthenticatedUser } from '@/lib/auth'
import { getAuthorizedPaymentRegistration, getPaymentById, type PaymentStatus } from '@/lib/payments'
import { createServiceClient } from '@/lib/supabase/server'

type MockPaymentPayload = {
  paymentId?: string
}

export async function updateMockPayment(request: NextRequest, status: Extract<PaymentStatus, 'paid' | 'failed' | 'expired'>) {
  const auth = await getAuthenticatedUser(request)

  if (!auth.ok) return unauthorizedResponse()

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return apiError('SERVER_CONFIG_MISSING', 'Konfigurasi server pembayaran belum lengkap.', 500)
  }

  let payload: MockPaymentPayload

  try {
    payload = (await request.json()) as MockPaymentPayload
  } catch {
    return apiError('INVALID_JSON', 'Format request tidak valid.', 400)
  }

  const paymentId = payload.paymentId?.trim()
  if (!paymentId) return apiError('PAYMENT_REQUIRED', 'Pembayaran wajib dipilih.', 400)

  const supabase = createServiceClient()
  const paymentResult = await getPaymentById(supabase, paymentId)
  if (!paymentResult.ok) return apiError(paymentResult.code as ApiErrorCode, paymentResult.message, paymentResult.status)

  const authorized = await getAuthorizedPaymentRegistration(supabase, paymentResult.payment.registration_id, auth.user.id)
  if (!authorized.ok) return apiError(authorized.code as ApiErrorCode, authorized.message, authorized.status)

  if (authorized.registration.status === 'verified' || authorized.registration.status === 'rejected') {
    return apiError('REGISTRATION_NOT_PAYABLE', 'Registrasi ini tidak dapat dibayar.', 409)
  }

  if (paymentResult.payment.provider !== 'mock') {
    return apiError('INVALID_PAYMENT_PROVIDER', 'Pembayaran ini bukan pembayaran mock.', 400)
  }

  if (paymentResult.payment.status !== 'pending') {
    return apiError('PAYMENT_NOT_PENDING', 'Pembayaran ini sudah tidak aktif.', 409)
  }

  const now = new Date().toISOString()
  const { data: payment, error } = await supabase
    .from('payments')
    .update({
      status,
      paid_at: status === 'paid' ? now : null,
      expired_at: status === 'expired' ? now : null,
    })
    .eq('id', paymentId)
    .eq('status', 'pending')
    .select('id, registration_id, provider, status, amount, currency, paid_at, expired_at, created_at, updated_at')
    .single()

  if (error || !payment) return apiError('PAYMENT_UPDATE_FAILED', 'Gagal memperbarui pembayaran.', 500)

  return apiSuccess({ payment })
}
