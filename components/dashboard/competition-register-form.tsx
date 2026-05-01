'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Plus, AlertCircle, CheckCircle2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import type { CompetitionSummary } from '@/lib/competitions'

type TeamMember = {
  name: string
  email: string
  institution: string
  role: string
}

type RegistrationFormProps = {
  competition: CompetitionSummary
}

const emptyMember = (): TeamMember => ({
  name: '',
  email: '',
  institution: '',
  role: 'Member',
})

export function CompetitionRegisterForm({ competition }: RegistrationFormProps) {
  const router = useRouter()
  const [teamName, setTeamName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([emptyMember()])
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const maxMembers = useMemo(() => competition.teamMax || 5, [competition.teamMax])
  const canAddMore = teamMembers.length < maxMembers

  const updateMember = (index: number, field: keyof TeamMember, value: string) => {
    setTeamMembers((current) => {
      const next = [...current]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const addMember = () => {
    if (canAddMore) {
      setTeamMembers((current) => [...current, emptyMember()])
    }
  }

  const removeMember = (index: number) => {
    setTeamMembers((current) => (current.length === 1 ? current : current.filter((_, idx) => idx !== index)))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          competitionId: competition._id,
          competitionSlug: competition.slug.current,
          competitionTitle: competition.title,
          teamName,
          contactEmail,
          teamMembers,
        }),
      })

      const payload = await response.json()

      if (!response.ok) {
        setErrorMessage(payload.error || 'Gagal mengirim registrasi. Coba lagi.')
        setSubmitting(false)
        return
      }

      setSuccessMessage('Registrasi berhasil! Silakan cek email konfirmasi.')
      setTimeout(() => router.push('/dashboard'), 2000)
    } catch (err) {
      setErrorMessage('Terjadi kesalahan. Silakan coba lagi.')
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Daftar Kompetisi</h1>
        <p className="mt-2 text-slate-600">
          Daftar untuk kompetisi <span className="font-semibold text-indigo-600">{competition.title}</span>
        </p>
      </div>

      {/* Status Messages */}
      {errorMessage && (
        <div className="flex gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-600" />
          <p className="text-sm text-rose-700">{errorMessage}</p>
        </div>
      )}

      {successMessage && (
        <div className="flex gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
          <p className="text-sm text-emerald-700">{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Team Info Section */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8">
          <h2 className="mb-6 text-xl font-semibold text-slate-900">Informasi Tim</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="teamName" className="block text-sm font-semibold text-slate-700">
                Nama Tim
              </label>
              <input
                id="teamName"
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Contoh: Tim Robotika ITB"
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                required
              />
            </div>

            <div>
              <label htmlFor="contactEmail" className="block text-sm font-semibold text-slate-700">
                Email Kontak
              </label>
              <input
                id="contactEmail"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="kontakt@tim.com"
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                required
              />
            </div>
          </div>
        </div>

        {/* Team Members Section */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Anggota Tim</h2>
            <span className="text-sm font-medium text-slate-500">
              {teamMembers.length} dari {maxMembers}
            </span>
          </div>

          <div className="space-y-5">
            {teamMembers.map((member, idx) => (
              <div key={idx} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">Anggota {idx + 1}</p>
                  {teamMembers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMember(idx)}
                      className="text-rose-600 hover:text-rose-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => updateMember(idx, 'name', e.target.value)}
                    placeholder="Nama lengkap"
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    required
                  />
                  <input
                    type="email"
                    value={member.email}
                    onChange={(e) => updateMember(idx, 'email', e.target.value)}
                    placeholder="Email"
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    required
                  />
                  <input
                    type="text"
                    value={member.institution}
                    onChange={(e) => updateMember(idx, 'institution', e.target.value)}
                    placeholder="Institusi/Sekolah"
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    required
                  />
                  <select
                    value={member.role}
                    onChange={(e) => updateMember(idx, 'role', e.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  >
                    <option>Leader</option>
                    <option>Member</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          {canAddMore && (
            <Button
              type="button"
              onClick={addMember}
              variant="outline"
              className="mt-4 w-full rounded-lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              Tambah Anggota
            </Button>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-full bg-indigo-600 px-6 hover:bg-indigo-700 disabled:bg-slate-300"
          >
            {submitting ? 'Mengirim...' : 'Kirim Registrasi'}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-full px-6"
            onClick={() => router.back()}
          >
            Batal
          </Button>
        </div>
      </form>
    </div>
  )
}
