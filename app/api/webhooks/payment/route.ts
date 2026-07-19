import { type NextRequest } from 'next/server'
import { POST as notificationHandler } from '@/app/api/payments/midtrans/notification/route'

export async function POST(request: NextRequest) {
  // Meneruskan request dari Midtrans secara langsung ke handler asli
  return notificationHandler(request)
}
