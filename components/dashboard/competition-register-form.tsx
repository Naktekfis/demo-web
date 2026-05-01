'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

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
  const [errorMessage, setErrorMessage] = useState('')

  const maxMembers = useMemo(() => competition.teamMax || 5, [competition.teamMax])

  const updateMember = (index: number, field: keyof TeamMember, value: string) => {
    setTeamMembers((current) => {
      const next = [...current]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const addMember = () => {
    setTeamMembers((current) => (current.length >= maxMembers ? current : [...current, emptyMember()]))
  }

  const removeMember = (index: number) => {
    setTeamMembers((current) => (current.length === 1 ? current : current.filter((_, idx) => idx !== index)))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setErrorMessage('')

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
        throw new Error(payload.error || 'Registration failed')
      }

      router.push(`/dashboard?registration=${payload.registration?.id || 'success'}`)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Nama tim</span>
          <input
            type="text"
            required
            value={teamName}
            onChange={(event) => setTeamName(event.target.value)}
            placeholder="Contoh: Delta Pulse"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Email kontak</span>
          <input
            type="email"
            required
            value={contactEmail}
            onChange={(event) => setContactEmail(event.target.value)}
            placeholder="team@itbinsight.id"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
          />
        </label>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">Anggota tim</h3>
            <p className="text-sm text-slate-500">Minimal 1 anggota, maksimal {maxMembers} anggota.</p>
          </div>
          <Button type="button" variant="outline" className="rounded-full px-4" onClick={addMember} disabled={teamMembers.length >= maxMembers}>
            + Tambah anggota
          </Button>
        </div>

        <div className="space-y-4">
          {teamMembers.map((member, index) => (
            <div key={`${member.email || 'member'}-${index}`} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-600">Anggota {index + 1}</p>
                {teamMembers.length > 1 ? (
                  <button type="button" onClick={() => removeMember(index)} className="text-sm font-medium text-rose-600 hover:text-rose-700">
                    Hapus
                  </button>
                ) : null}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Nama</span>
                  <input
                    type="text"
                    required
                    value={member.name}
                    onChange={(event) => updateMember(index, 'name', event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Email</span>
                  <input
                    type="email"
                    required
                    value={member.email}
                    onChange={(event) => updateMember(index, 'email', event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Institusi</span>
                  <input
                    type="text"
                    required
                    value={member.institution}
                    onChange={(event) => updateMember(index, 'institution', event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      <Button type="submit" size="lg" className="w-full rounded-full px-6" disabled={submitting}>
        {submitting ? 'Mengirim...' : 'Kirim pendaftaran'}
      </Button>
    </form>
  )
}
