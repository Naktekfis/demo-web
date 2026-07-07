import { type User } from '@supabase/supabase-js'

import { apiError, type ApiErrorCode } from '@/lib/api-response'
import { findOrCreateCompetitionRow, type CompetitionRow } from '@/lib/registrations'

type ServiceClient = ReturnType<typeof import('@/lib/supabase/server').createServiceClient>

type TeamCompetitionResult =
  | { ok: true; competition: CompetitionRow }
  | { ok: false; code: ApiErrorCode; message: string; status: number }

export type TeamProfilePayload = {
  name?: string
  phoneNumber?: string
  institution?: string
}

export function isRegistrationOpen(registrationOpen: string | null, registrationClose: string | null) {
  const now = Date.now()
  const opensAt = registrationOpen ? new Date(registrationOpen).getTime() : null
  const closesAt = registrationClose ? new Date(registrationClose).getTime() : null

  if ((opensAt !== null && Number.isNaN(opensAt)) || (closesAt !== null && Number.isNaN(closesAt))) {
    return false
  }

  return (opensAt === null || opensAt <= now) && (closesAt === null || closesAt >= now)
}

export async function getTeamCompetition(competitionSlug: string): Promise<TeamCompetitionResult> {
  const competitionResult = await findOrCreateCompetitionRow(competitionSlug)

  if (!competitionResult.ok) {
    return {
      ok: false,
      code: competitionResult.code as ApiErrorCode,
      message: competitionResult.message,
      status: competitionResult.status,
    }
  }

  const { competition } = competitionResult

  if (!competition.is_active || !isRegistrationOpen(competition.registration_open, competition.registration_close)) {
    return { ok: false, code: 'REGISTRATION_CLOSED', message: 'Registrasi kompetisi sedang tidak dibuka.', status: 400 }
  }

  if (competition.registration_type !== 'team') {
    return { ok: false, code: 'INVALID_COMPETITION_TYPE', message: 'Kompetisi ini tidak memakai alur tim.', status: 400 }
  }

  if (!competition.team_uid_prefix) {
    return { ok: false, code: 'TEAM_PREFIX_MISSING', message: 'Prefix UID tim belum dikonfigurasi.', status: 500 }
  }

  return { ok: true, competition }
}

export async function ensureTeamProfile(supabase: ServiceClient, user: User, payload: TeamProfilePayload) {
  const userEmail = user.email || ''
  const payloadName = payload.name?.trim()
  const metadataName = typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name.trim() : ''
  const fullName = payloadName || metadataName || userEmail || 'Visitor'
  const phone = payload.phoneNumber?.trim()
  const institution = payload.institution?.trim()

  const { data: existingProfile, error: existingProfileError } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone, institution')
    .eq('id', user.id)
    .maybeSingle()

  if (existingProfileError) {
    return { ok: false as const, response: apiError('PROFILE_REQUIRED', 'Profil pengguna belum siap. Silakan coba lagi.', 500) }
  }

  const profileInput = {
    full_name: fullName,
    email: userEmail,
    phone: phone || existingProfile?.phone || null,
    institution: institution || existingProfile?.institution || null,
  }

  const profileQuery = existingProfile
    ? supabase.from('profiles').update(profileInput).eq('id', user.id)
    : supabase.from('profiles').insert({ id: user.id, ...profileInput })

  const { data: profile, error: profileError } = await profileQuery
    .select('id, full_name, email, phone, institution')
    .single()

  if (profileError || !profile) {
    return { ok: false as const, response: apiError('PROFILE_REQUIRED', 'Profil pengguna belum siap. Silakan coba lagi.', 500) }
  }

  if (!profile.phone?.trim()) {
    return { ok: false as const, response: apiError('PHONE_REQUIRED', 'Nomor telepon wajib dilengkapi sebelum membuat atau bergabung tim.', 400) }
  }

  if (!profile.institution?.trim()) {
    return { ok: false as const, response: apiError('INSTITUTION_REQUIRED', 'Institusi wajib dilengkapi sebelum membuat atau bergabung tim.', 400) }
  }

  return { ok: true as const, profile }
}

export async function findUserTeamForCompetition(supabase: ServiceClient, userId: string, competitionId: string) {
  const { data, error } = await supabase
    .from('competition_team_members')
    .select('id, team_id, competition_teams!inner(id, competition_id, team_uid, team_name, status)')
    .eq('user_id', userId)
    .eq('competition_teams.competition_id', competitionId)
    .maybeSingle()

  return { data, error }
}
