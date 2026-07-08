type MidtransCustomerDetails = {
  first_name: string
  email?: string
  phone?: string
}

type MidtransItemDetails = {
  id: string
  name: string
}

export type CreateMidtransSnapTransactionInput = {
  orderId: string
  amount: number
  customer: MidtransCustomerDetails
  item: MidtransItemDetails
  finishUrl: string
}

export type MidtransSnapTransaction = {
  token: string
  redirect_url: string
}

function getMidtransServerKey() {
  return process.env.MIDTRANS_SERVER_KEY?.trim()
}

function getMidtransSnapUrl() {
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true'
  return isProduction
    ? 'https://app.midtrans.com/snap/v1/transactions'
    : 'https://app.sandbox.midtrans.com/snap/v1/transactions'
}

function truncate(value: string, maxLength: number) {
  return value.length > maxLength ? value.slice(0, maxLength) : value
}

export function hasMidtransConfig() {
  return Boolean(getMidtransServerKey())
}

export async function createMidtransSnapTransaction(input: CreateMidtransSnapTransactionInput) {
  const serverKey = getMidtransServerKey()

  if (!serverKey) {
    return {
      ok: false as const,
      code: 'MIDTRANS_CONFIG_MISSING',
      message: 'Konfigurasi Midtrans belum lengkap.',
      status: 500,
    }
  }

  const grossAmount = Math.round(input.amount)
  const response = await fetch(getMidtransSnapUrl(), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Basic ${Buffer.from(`${serverKey}:`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      transaction_details: {
        order_id: input.orderId,
        gross_amount: grossAmount,
      },
      customer_details: {
        first_name: truncate(input.customer.first_name || 'Visitor', 255),
        email: input.customer.email || undefined,
        phone: input.customer.phone || undefined,
      },
      item_details: [
        {
          id: truncate(input.item.id, 50),
          price: grossAmount,
          quantity: 1,
          name: truncate(input.item.name, 50),
        },
      ],
      callbacks: {
        finish: input.finishUrl,
      },
    }),
  })

  const rawResponse = (await response.json().catch(() => null)) as MidtransSnapTransaction | { error_messages?: string[] } | null

  if (!response.ok || !rawResponse || !('token' in rawResponse) || !rawResponse.token || !rawResponse.redirect_url) {
    return {
      ok: false as const,
      code: 'MIDTRANS_CREATE_FAILED',
      message: 'Gagal membuat transaksi Midtrans.',
      status: 502,
      rawResponse,
    }
  }

  return {
    ok: true as const,
    transaction: rawResponse,
    rawResponse,
  }
}
