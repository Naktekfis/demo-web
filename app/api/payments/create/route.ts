import { type NextRequest } from 'next/server'

import { apiError, apiSuccess, unauthorizedResponse, type ApiErrorCode } from '@/lib/api-response'
import { getAuthenticatedUser } from '@/lib/auth'
import { createMidtransSnapTransaction, hasMidtransConfig } from '@/lib/midtrans'
import { checkRateLimit, rateLimitResponse, sensitiveMutationRateLimit } from '@/lib/rate-limit'
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

type ProfileSummary = {
  full_name: string
  email: string
  phone: string | null
}

type MidtransTransactionSummary = {
  order_id: string
  snap_token: string | null
  redirect_url: string | null
}

function mockPaymentResponse(payment: PaymentSummary) {
  return {
    payment,
    redirectUrl: `/dashboard/payments/${payment.id}/mock`,
  }
}

async function paymentResponse(supabase: ReturnType<typeof createServiceClient>, payment: PaymentSummary) {
  if (payment.provider !== 'midtrans') return mockPaymentResponse(payment)

  const { data, error } = await supabase
    .from('midtrans_transactions')
    .select('order_id, snap_token, redirect_url')
    .eq('payment_id', payment.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data?.redirect_url) return null

  const transaction = data as MidtransTransactionSummary

  return {
    payment: {
      ...payment,
      orderId: transaction.order_id,
      snapToken: transaction.snap_token,
      redirectUrl: transaction.redirect_url,
    },
    redirectUrl: transaction.redirect_url,
  }
}

function createMidtransOrderId(paymentId: string) {
  return `INSIGHT-${paymentId}`
}

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUser(request)

  if (!auth.ok) return unauthorizedResponse()

  const rateLimit = checkRateLimit(request, {
    scope: 'payment-create',
    identity: auth.user.id,
    ...sensitiveMutationRateLimit,
  })

  if (!rateLimit.allowed) return rateLimitResponse(rateLimit.retryAfterSeconds)

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
  if (provider !== 'mock' && provider !== 'midtrans') {
    return apiError('INVALID_PROVIDER', 'Provider pembayaran tidak valid.', 400)
  }

  if (provider === 'midtrans' && !hasMidtransConfig()) {
    return apiError('MIDTRANS_CONFIG_MISSING', 'Konfigurasi Midtrans belum lengkap.', 500)
  }

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
  if (pendingPayment) {
    const response = await paymentResponse(supabase, pendingPayment as PaymentSummary)

    if (!response) return apiError('PAYMENT_RESUME_FAILED', 'Gagal melanjutkan pembayaran aktif.', 500)

    return apiSuccess(response)
  }

  const amount = await getRegistrationPaymentAmount(authorized.registration.competitionSlug)
  const { data: payment, error: insertError } = await supabase
    .from('payments')
    .insert({
      registration_id: registrationId,
      provider,
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

      if (racedPayment) {
        const response = await paymentResponse(supabase, racedPayment as PaymentSummary)

        if (!response) return apiError('PAYMENT_RESUME_FAILED', 'Gagal melanjutkan pembayaran aktif.', 500)

        return apiSuccess(response)
      }
    }

    return apiError('PAYMENT_CREATE_FAILED', 'Gagal membuat pembayaran.', 500)
  }

  const createdPayment = payment as PaymentSummary

  if (provider === 'mock') return apiSuccess(mockPaymentResponse(createdPayment), 201)

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, phone')
    .eq('id', auth.user.id)
    .maybeSingle()

  const customer = profile as ProfileSummary | null
  const itemName = authorized.registration.teamName
    ? `${authorized.registration.competitionName || 'Kompetisi'} - ${authorized.registration.teamName}`
    : authorized.registration.competitionName || 'Registrasi Kompetisi'
  const orderId = createMidtransOrderId(createdPayment.id)
  const snapResult = await createMidtransSnapTransaction({
    orderId,
    amount,
    customer: {
      first_name: customer?.full_name || auth.user.email || 'Visitor',
      email: customer?.email || auth.user.email || undefined,
      phone: customer?.phone || undefined,
    },
    item: {
      id: authorized.registration.competitionSlug || createdPayment.id,
      name: itemName,
    },
    finishUrl: new URL('/dashboard', request.nextUrl.origin).toString(),
  })

  if (!snapResult.ok) {
    await supabase.from('payments').update({ status: 'failed' }).eq('id', createdPayment.id)
    return apiError(snapResult.code as ApiErrorCode, snapResult.message, snapResult.status)
  }

  const { error: transactionInsertError } = await supabase.from('midtrans_transactions').insert({
    payment_id: createdPayment.id,
    order_id: orderId,
    snap_token: snapResult.transaction.token,
    redirect_url: snapResult.transaction.redirect_url,
    transaction_status: 'pending',
    gross_amount: amount,
    raw_response: snapResult.rawResponse,
  })

  if (transactionInsertError) {
    await supabase.from('payments').update({ status: 'failed' }).eq('id', createdPayment.id)
    return apiError('MIDTRANS_TRANSACTION_SAVE_FAILED', 'Gagal menyimpan transaksi Midtrans.', 500)
  }

  return apiSuccess(
    {
      payment: {
        ...createdPayment,
        orderId,
        snapToken: snapResult.transaction.token,
        redirectUrl: snapResult.transaction.redirect_url,
      },
      redirectUrl: snapResult.transaction.redirect_url,
    },
    201,
  )
}
