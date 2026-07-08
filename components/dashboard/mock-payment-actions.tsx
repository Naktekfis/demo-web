'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

type MockPaymentActionsProps = {
  paymentId: string
  disabled?: boolean
}

type ApiEnvelope<T> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: { code: string; message: string } }

const actions = [
  { endpoint: '/api/payments/mock/settle', label: 'Simulasi Sukses', className: 'bg-emerald-600 hover:bg-emerald-700' },
  { endpoint: '/api/payments/mock/fail', label: 'Simulasi Gagal', className: 'bg-rose-600 hover:bg-rose-700' },
  { endpoint: '/api/payments/mock/expire', label: 'Simulasi Expire', className: 'bg-slate-700 hover:bg-slate-800' },
]

export function MockPaymentActions({ paymentId, disabled }: MockPaymentActionsProps) {
  const router = useRouter()
  const [pendingEndpoint, setPendingEndpoint] = useState('')
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleAction = async (endpoint: string) => {
    setPendingEndpoint(endpoint)
    setMessage('')
    setErrorMessage('')

    try {
      const supabase = createClient()
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token

      if (!accessToken) {
        router.push(`/auth/login?next=${encodeURIComponent(`/dashboard/payments/${paymentId}/mock`)}`)
        return
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ paymentId }),
      })

      const payload = (await response.json()) as ApiEnvelope<{ payment: { status: string } }>

      if (!response.ok || !payload.success) {
        setErrorMessage(payload.error?.message || 'Gagal memperbarui pembayaran.')
        return
      }

      setMessage(`Status pembayaran menjadi ${payload.data.payment.status}.`)
      router.refresh()
    } catch {
      setErrorMessage('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setPendingEndpoint('')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {actions.map((action) => (
          <Button
            key={action.endpoint}
            type="button"
            disabled={disabled || Boolean(pendingEndpoint)}
            onClick={() => handleAction(action.endpoint)}
            className={`rounded-full ${action.className}`}
          >
            {pendingEndpoint === action.endpoint ? 'Memproses...' : action.label}
          </Button>
        ))}
      </div>
      {message && (
        <p className="flex items-center gap-2 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          {message}
        </p>
      )}
      {errorMessage && (
        <p className="flex items-center gap-2 text-sm font-medium text-rose-700">
          <AlertCircle className="h-4 w-4" />
          {errorMessage}
        </p>
      )}
    </div>
  )
}
