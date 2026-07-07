'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

type ApiEnvelope<T> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: { code: string; message: string } }

type TeamSubmitButtonProps = {
  teamId: string
  disabledReason?: string
}

export function TeamSubmitButton({ teamId, disabledReason }: TeamSubmitButtonProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState(disabledReason || '')

  const handleSubmit = async () => {
    setSubmitting(true)
    setMessage('')
    setErrorMessage('')

    try {
      const supabase = createClient()
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token

      if (!accessToken) {
        router.push(`/auth/login?next=${encodeURIComponent('/dashboard')}`)
        return
      }

      const response = await fetch('/api/registrations/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ teamId }),
      })

      const payload = (await response.json()) as ApiEnvelope<{ registration: { status: string } }>

      if (!response.ok || !payload.success) {
        setErrorMessage(payload.error?.message || 'Gagal mengirim registrasi tim.')
        return
      }

      setMessage('Registrasi tim berhasil dikirim dan menunggu review admin.')
      router.refresh()
    } catch {
      setErrorMessage('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        size="sm"
        disabled={submitting || Boolean(disabledReason)}
        onClick={handleSubmit}
        className="rounded-full bg-indigo-600 hover:bg-indigo-700"
      >
        {submitting ? 'Mengirim...' : 'Submit Registrasi Tim'}
      </Button>
      {message && (
        <p className="flex items-center gap-2 text-xs font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          {message}
        </p>
      )}
      {errorMessage && (
        <p className="flex items-center gap-2 text-xs font-medium text-rose-700">
          <AlertCircle className="h-4 w-4" />
          {errorMessage}
        </p>
      )}
    </div>
  )
}
