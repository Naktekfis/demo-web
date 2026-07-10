'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

type ApiEnvelope<T> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: { code: string; message: string } }

type PaymentActionButtonProps = {
  registrationId: string
  paymentProvider?: string
  paymentStatus?: string
}

export function PaymentActionButton({ registrationId, paymentProvider, paymentStatus }: PaymentActionButtonProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handlePayment = async () => {
    setSubmitting(true)
    setErrorMessage('')

    try {
      const supabase = createClient()
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token

      if (!accessToken) {
        router.push(`/auth/login?next=${encodeURIComponent('/dashboard')}`)
        return
      }

      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ registrationId, provider: paymentProvider || 'mock' }),
      })

      const payload = (await response.json()) as ApiEnvelope<{ redirectUrl: string }>

      if (!response.ok || !payload.success) {
        setErrorMessage(payload.error?.message || 'Gagal membuat pembayaran.')
        return
      }

      router.push(payload.data.redirectUrl)
    } catch {
      setErrorMessage('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  const label = paymentStatus === 'pending' ? 'Lanjutkan Bayar' : paymentStatus === 'unpaid' ? 'Bayar' : 'Coba Bayar Lagi'

  return (
    <div className="space-y-2">
      <Button
        type="button"
        size="sm"
        disabled={submitting}
        onClick={handlePayment}
        className="rounded-full bg-emerald-600 hover:bg-emerald-700"
      >
        {submitting ? 'Menyiapkan...' : label}
      </Button>
      {errorMessage && (
        <p className="flex items-center gap-2 text-xs font-medium text-rose-700">
          <AlertCircle className="h-4 w-4" />
          {errorMessage}
        </p>
      )}
    </div>
  )
}
