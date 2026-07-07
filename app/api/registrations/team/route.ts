import { type NextRequest } from 'next/server'

import { apiError, apiSuccess, unauthorizedResponse } from '@/lib/api-response'
import { getAuthenticatedUser } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/server'
import { isRegistrationOpen } from '@/lib/team-registration'

type TeamRegistrationPayload = {
  teamId?: string
}

type TeamWithCompetition = {
  id: string
  competition_id: string
  team_uid: string
  team_name: string
  leader_user_id: string
  status: string
  competitions:
    | {
        id: string
        slug: string
        name: string
        registration_type: string
        team_min: number
        team_max: number
        registration_open: string | null
        registration_close: string | null
        is_active: boolean
      }
    | Array<{
        id: string
        slug: string
        name: string
        registration_type: string
        team_min: number
        team_max: number
        registration_open: string | null
        registration_close: string | null
        is_active: boolean
      }>
    | null
}

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUser(request)

  if (!auth.ok) return unauthorizedResponse()

  let payload: TeamRegistrationPayload

  try {
    payload = (await request.json()) as TeamRegistrationPayload
  } catch {
    return apiError('INVALID_JSON', 'Format request tidak valid.', 400)
  }

  const teamId = payload.teamId?.trim()
  if (!teamId) return apiError('TEAM_REQUIRED', 'Tim wajib dipilih.', 400)

  const supabase = createServiceClient()
  const { data: teamData, error: teamError } = await supabase
    .from('competition_teams')
    .select(
      'id, competition_id, team_uid, team_name, leader_user_id, status, competitions(id, slug, name, registration_type, team_min, team_max, registration_open, registration_close, is_active)',
    )
    .eq('id', teamId)
    .maybeSingle()

  if (teamError) return apiError('TEAM_LOOKUP_FAILED', 'Gagal memuat tim.', 500)
  if (!teamData) return apiError('TEAM_NOT_FOUND', 'Tim tidak ditemukan.', 404)

  const team = teamData as TeamWithCompetition
  const competition = Array.isArray(team.competitions) ? team.competitions[0] : team.competitions

  if (team.leader_user_id !== auth.user.id) {
    return apiError('TEAM_LEADER_ONLY', 'Hanya leader yang dapat mengirim registrasi tim.', 403)
  }

  if (team.status !== 'draft') {
    return apiError('TEAM_ALREADY_SUBMITTED', 'Registrasi tim ini sudah dikirim.', 409)
  }

  if (!competition) return apiError('COMPETITION_NOT_FOUND', 'Kompetisi tidak ditemukan.', 404)
  if (!competition.is_active || !isRegistrationOpen(competition.registration_open, competition.registration_close)) {
    return apiError('REGISTRATION_CLOSED', 'Registrasi kompetisi sedang tidak dibuka.', 400)
  }

  if (competition.registration_type !== 'team') {
    return apiError('INVALID_COMPETITION_TYPE', 'Kompetisi ini tidak memakai alur tim.', 400)
  }

  const { count, error: countError } = await supabase
    .from('competition_team_members')
    .select('id', { count: 'exact', head: true })
    .eq('team_id', team.id)

  if (countError) return apiError('TEAM_MEMBER_LOOKUP_FAILED', 'Gagal memeriksa anggota tim.', 500)

  const memberCount = count || 0
  if (memberCount < competition.team_min) {
    return apiError('TEAM_BELOW_MINIMUM', `Tim minimal berisi ${competition.team_min} anggota.`, 400)
  }

  if (memberCount > competition.team_max) {
    return apiError('TEAM_ABOVE_MAXIMUM', `Tim maksimal berisi ${competition.team_max} anggota.`, 400)
  }

  const { data: existingRegistration, error: existingError } = await supabase
    .from('competition_registrations')
    .select('id')
    .eq('competition_id', competition.id)
    .eq('team_id', team.id)
    .eq('registration_kind', 'team')
    .maybeSingle()

  if (existingError) return apiError('REGISTRATION_LOOKUP_FAILED', 'Gagal memeriksa registrasi sebelumnya.', 500)
  if (existingRegistration) return apiError('TEAM_ALREADY_SUBMITTED', 'Registrasi tim ini sudah dikirim.', 409)

  const { data: submission, error: submissionError } = await supabase.rpc('submit_team_registration', {
    p_team_id: team.id,
    p_leader_user_id: auth.user.id,
  })

  if (submissionError) {
    if (submissionError.code === '23505' || submissionError.message.includes('TEAM_ALREADY_SUBMITTED')) {
      return apiError('TEAM_ALREADY_SUBMITTED', 'Registrasi tim ini sudah dikirim.', 409)
    }

    return apiError('TEAM_REGISTRATION_CREATE_FAILED', 'Gagal mengirim registrasi tim.', 500)
  }

  const registration = Array.isArray(submission) ? submission[0] : submission
  if (!registration) return apiError('TEAM_REGISTRATION_CREATE_FAILED', 'Gagal mengirim registrasi tim.', 500)

  return apiSuccess(
    {
      registration: {
        id: registration.registration_id,
        competitionSlug: competition.slug,
        registrationKind: 'team',
        status: registration.registration_status,
        submittedAt: registration.registration_submitted_at,
      },
      team: {
        id: team.id,
        teamUid: team.team_uid,
        teamName: team.team_name,
        status: registration.team_status,
      },
    },
    201,
  )
}
