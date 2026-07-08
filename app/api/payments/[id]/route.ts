import { type NextRequest } from 'next/server'

import { apiError, apiSuccess, unauthorizedResponse, type ApiErrorCode } from '@/lib/api-response'
import { getAuthenticatedUser } from '@/lib/auth'
import { getAuthorizedPaymentRegistration, getPaymentById } from '@/lib/payments'
import { createServiceClient } from '@/lib/supabase/server'

type PaymentRouteParams = {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: PaymentRouteParams) {
  const auth = await getAuthenticatedUser(request)

  if (!auth.ok) return unauthorizedResponse()

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return apiError('SERVER_CONFIG_MISSING', 'Konfigurasi server pembayaran belum lengkap.', 500)
  }

  const paymentId = params.id?.trim()
  if (!paymentId) return apiError('PAYMENT_REQUIRED', 'Pembayaran wajib dipilih.', 400)

  const supabase = createServiceClient()
  const paymentResult = await getPaymentById(supabase, paymentId)

  if (!paymentResult.ok) return apiError(paymentResult.code as ApiErrorCode, paymentResult.message, paymentResult.status)

  const authorized = await getAuthorizedPaymentRegistration(supabase, paymentResult.payment.registration_id, auth.user.id)
  if (!authorized.ok) return apiError(authorized.code as ApiErrorCode, authorized.message, authorized.status)

  return apiSuccess({ payment: paymentResult.payment, registration: authorized.registration })
}
