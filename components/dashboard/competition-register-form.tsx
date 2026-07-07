'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Plus, AlertCircle, CheckCircle2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import type { CompetitionSummary } from '@/lib/competitions'

type TeamMember = {
  id: string
  name: string
  email: string
  institution: string
  role: string
}

type RegistrationFormProps = {
  competition: CompetitionSummary
}

const emptyMember = (role = 'Member'): TeamMember => ({
  id: globalThis.crypto?.randomUUID?.() || Math.random().toString(36),
  name: '',
  email: '',
  institution: '',
  role,
})

export function CompetitionRegisterForm({ competition }: RegistrationFormProps) {
  const router = useRouter()
  const [participantName, setParticipantName] = useState('')
  const [participantEmail, setParticipantEmail] = useState('')
  const [participantInstitution, setParticipantInstitution] = useState('')
  const [teamName, setTeamName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([emptyMember('Leader')])
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const isIndividual = competition.registrationType === 'individual'
  const minMembers = useMemo(() => competition.teamMin || 1, [competition.teamMin])
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
      const normalizedTeamMembers = isIndividual
        ? [
            {
              id: 'participant',
              name: participantName,
              email: participantEmail,
              institution: participantInstitution,
              role: 'Leader',
            },
          ]
        : teamMembers

      if (!isIndividual && teamMembers.length < minMembers) {
        setErrorMessage(`Tim minimal berisi ${minMembers} anggota.`)
        setSubmitting(false)
        return
      }

      const emails = normalizedTeamMembers.map((member) => member.email.trim().toLowerCase())
      const leaderCount = normalizedTeamMembers.filter((member) => member.role === 'Leader').length

      if (new Set(emails).size !== emails.length) {
        setErrorMessage('Email anggota tidak boleh duplikat.')
        setSubmitting(false)
        return
      }

      if (leaderCount !== 1) {
        setErrorMessage('Tim harus punya tepat 1 Leader.')
        setSubmitting(false)
        return
      }

      const supabase = createClient()
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token

      if (!accessToken) {
        setSubmitting(false)
        router.push(`/auth/login?next=${encodeURIComponent(`/dashboard/register-competition?comp=${competition.slug.current}`)}`)
        return
      }

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
          registrationType: competition.registrationType,
          teamName: isIndividual ? participantName : teamName,
          contactEmail: isIndividual ? participantEmail : contactEmail,
          teamMembers: normalizedTeamMembers,
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
          <span className="ml-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            {isIndividual ? 'Individu' : 'Tim'}
          </span>
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
        {/* Registration Info Section */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8">
          <h2 className="mb-6 text-xl font-semibold text-slate-900">
            {isIndividual ? 'Informasi Peserta' : 'Informasi Tim'}
          </h2>

          <div className="space-y-4">
            {isIndividual ? (
              <>
                <div>
                  <label htmlFor="participantName" className="block text-sm font-semibold text-slate-700">
                    Nama Lengkap
                  </label>
                  <input
                    id="participantName"
                    type="text"
                    value={participantName}
                    onChange={(e) => setParticipantName(e.target.value)}
                    placeholder="Nama peserta"
                    className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="participantEmail" className="block text-sm font-semibold text-slate-700">
                    Email Peserta
                  </label>
                  <input
                    id="participantEmail"
                    type="email"
                    value={participantEmail}
                    onChange={(e) => setParticipantEmail(e.target.value)}
                    placeholder="peserta@email.com"
                    className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="participantInstitution" className="block text-sm font-semibold text-slate-700">
                    Institusi/Sekolah
                  </label>
                  <input
                    id="participantInstitution"
                    type="text"
                    value={participantInstitution}
                    onChange={(e) => setParticipantInstitution(e.target.value)}
                    placeholder="Institusi peserta"
                    className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    required
                  />
                </div>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>

        {/* Team Members Section */}
        {!isIndividual && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Anggota Tim</h2>
              <span className="text-sm font-medium text-slate-500">
                {teamMembers.length} dari {minMembers}-{maxMembers}
              </span>
            </div>

            <div className="space-y-5">
              {teamMembers.map((member, idx) => (
                <div key={member.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
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
        )}

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
