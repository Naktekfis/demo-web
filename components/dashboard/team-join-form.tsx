'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import type { CompetitionSummary } from '@/lib/competitions'

type ApiEnvelope<T> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: { code: string; message: string } }

type TeamJoinFormProps = {
  competition: CompetitionSummary
}

export function TeamJoinForm({ competition }: TeamJoinFormProps) {
  const router = useRouter()
  const [teamUid, setTeamUid] = useState('')
  const [name, setName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [institution, setInstitution] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const supabase = createClient()
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token

      if (!accessToken) {
        router.push(`/auth/login?next=${encodeURIComponent(`/dashboard/teams/join?comp=${competition.slug.current}`)}`)
        return
      }

      const response = await fetch('/api/teams/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          competitionSlug: competition.slug.current,
          teamUid,
          name,
          phoneNumber,
          institution,
        }),
      })

      const payload = (await response.json()) as ApiEnvelope<{
        team: { team_uid: string; team_name: string }
      }>

      if (!response.ok || !payload.success) {
        setErrorMessage(payload.error?.message || 'Gagal bergabung ke tim.')
        setSubmitting(false)
        return
      }

      setSuccessMessage(`Berhasil bergabung ke tim ${payload.data.team.team_name} (${payload.data.team.team_uid}).`)
      router.refresh()
    } catch {
      setErrorMessage('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
      {errorMessage && (
        <div className="flex gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}

      {successMessage && (
        <div className="flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <p>{successMessage}</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">
          UID Tim
          <input
            type="text"
            value={teamUid}
            onChange={(event) => setTeamUid(event.target.value)}
            placeholder={`${competition.teamUidPrefix || 'TIM'}-A7K2QD`}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2 font-mono text-sm uppercase focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            required
          />
        </label>
        <label className="block text-sm font-semibold text-slate-700">
          Nama Anggota
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            required
          />
        </label>
        <label className="block text-sm font-semibold text-slate-700">
          Nomor Telepon
          <input
            type="tel"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            required
          />
        </label>
        <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">
          Institusi
          <input
            type="text"
            value={institution}
            onChange={(event) => setInstitution(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            required
          />
        </label>
      </div>

      <Button type="submit" disabled={submitting} className="w-full rounded-full bg-indigo-600 hover:bg-indigo-700">
        {submitting ? 'Bergabung...' : 'Gabung Tim'}
      </Button>
    </form>
  )
}
