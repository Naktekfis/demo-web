import { type NextRequest } from 'next/server'

import { updateMockPayment } from '@/lib/mock-payments'

export async function POST(request: NextRequest) {
  return updateMockPayment(request, 'failed')
}
