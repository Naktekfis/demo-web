import { type NextRequest } from 'next/server'

import { apiError, apiSuccess } from '@/lib/api-response'
import {
  mapMidtransPaymentStatus,
  hasMidtransConfig,
  verifyMidtransSignature,
  type MappedMidtransPaymentStatus,
  type MidtransNotificationPayload,
} from '@/lib/midtrans'
import { createServiceClient } from '@/lib/supabase/server'

type PaymentRow = {
  id: string
  status: string
}

type TransactionRow = {
  id: string
  payment_id: string
  order_id: string
  payments: PaymentRow | PaymentRow[] | null
}

function firstRelation<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] : value || null
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function parseNotificationPayload(value: unknown): MidtransNotificationPayload | null {
  if (!isObject(value)) return null

  const orderId = value.order_id
  const statusCode = value.status_code
  const grossAmount = value.gross_amount
  const signatureKey = value.signature_key
  const transactionStatus = value.transaction_status

  if (
    typeof orderId !== 'string' ||
    typeof statusCode !== 'string' ||
    typeof grossAmount !== 'string' ||
    typeof signatureKey !== 'string' ||
    typeof transactionStatus !== 'string'
  ) {
    return null
  }

  return value as MidtransNotificationPayload
}

function nextPaymentUpdate(currentStatus: string, notificationStatus: MappedMidtransPaymentStatus) {
  if (currentStatus === 'paid') return null
  if (notificationStatus !== 'paid' && currentStatus !== 'pending') return null

  const now = new Date().toISOString()
  const update: Record<string, string | null> = { status: notificationStatus }

  if (notificationStatus === 'paid') update.paid_at = now
  if (notificationStatus === 'expired') update.expired_at = now

  return update
}

export async function POST(request: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return apiError('SERVER_CONFIG_MISSING', 'Konfigurasi server pembayaran belum lengkap.', 500)
  }

  if (!hasMidtransConfig()) return apiError('MIDTRANS_CONFIG_MISSING', 'Konfigurasi Midtrans belum lengkap.', 500)

  let rawBody: string

  try {
    rawBody = await request.text()
  } catch {
    return apiError('INVALID_BODY', 'Payload notifikasi tidak valid.', 400)
  }

  let parsedBody: unknown

  try {
    parsedBody = JSON.parse(rawBody)
  } catch {
    return apiError('INVALID_JSON', 'Format notifikasi tidak valid.', 400)
  }

  const payload = parseNotificationPayload(parsedBody)

  if (!payload) return apiError('INVALID_NOTIFICATION', 'Payload notifikasi tidak lengkap.', 400)
  if (!verifyMidtransSignature(payload)) return apiError('INVALID_SIGNATURE', 'Signature Midtrans tidak valid.', 401)

  const supabase = createServiceClient()
  const { data: transactionData, error: transactionError } = await supabase
    .from('midtrans_transactions')
    .select('id, payment_id, order_id, payments(id, status)')
    .eq('order_id', payload.order_id)
    .maybeSingle()

  if (transactionError) return apiError('MIDTRANS_TRANSACTION_LOOKUP_FAILED', 'Gagal memuat transaksi Midtrans.', 500)
  if (!transactionData) return apiError('MIDTRANS_TRANSACTION_NOT_FOUND', 'Transaksi Midtrans tidak ditemukan.', 404)

  const transaction = transactionData as TransactionRow
  const payment = firstRelation(transaction.payments)

  if (!payment) return apiError('PAYMENT_NOT_FOUND', 'Pembayaran tidak ditemukan.', 404)

  const notificationStatus = mapMidtransPaymentStatus(payload)
  const paymentUpdate = nextPaymentUpdate(payment.status, notificationStatus)
  const { error: transactionUpdateError } = await supabase
    .from('midtrans_transactions')
    .update({
      transaction_status: payload.transaction_status,
      fraud_status: typeof payload.fraud_status === 'string' ? payload.fraud_status : null,
      gross_amount: Number.isFinite(Number(payload.gross_amount)) ? Math.round(Number(payload.gross_amount)) : null,
      raw_notification: payload,
    })
    .eq('id', transaction.id)

  if (transactionUpdateError) {
    return apiError('MIDTRANS_TRANSACTION_UPDATE_FAILED', 'Gagal menyimpan notifikasi Midtrans.', 500)
  }

  if (paymentUpdate) {
    const { error: paymentUpdateError } = await supabase.from('payments').update(paymentUpdate).eq('id', payment.id)

    if (paymentUpdateError) return apiError('PAYMENT_UPDATE_FAILED', 'Gagal memperbarui pembayaran.', 500)
  }

  return apiSuccess({
    orderId: payload.order_id,
    transactionStatus: payload.transaction_status,
    paymentStatus: paymentUpdate?.status || payment.status,
  })
}
