import { type NextRequest } from 'next/server'

import { apiError, apiSuccess, unauthorizedResponse } from '@/lib/api-response'
import { getAuthenticatedUser } from '@/lib/auth'
import { ensureTeamProfile, findUserTeamForCompetition, getTeamCompetition } from '@/lib/team-registration'
import { createServiceClient } from '@/lib/supabase/server'
import { isValidTeamUid, normalizeTeamUid } from '@/lib/teams'

type TeamJoinPayload = {
  competitionSlug?: string
  teamUid?: string
  name?: string
  phoneNumber?: string
  institution?: string
}

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUser(request)

  if (!auth.ok) return unauthorizedResponse()

  let payload: TeamJoinPayload

  try {
    payload = (await request.json()) as TeamJoinPayload
  } catch {
    return apiError('INVALID_JSON', 'Format request tidak valid.', 400)
  }

  const competitionSlug = payload.competitionSlug?.trim()
  const requestedTeamUid = payload.teamUid ? normalizeTeamUid(payload.teamUid) : ''

  if (!competitionSlug) return apiError('COMPETITION_REQUIRED', 'Kompetisi wajib dipilih.', 400)

  const competitionResult = await getTeamCompetition(competitionSlug)
  if (!competitionResult.ok) return apiError(competitionResult.code, competitionResult.message, competitionResult.status)

  const { competition } = competitionResult

  if (!requestedTeamUid || !isValidTeamUid(requestedTeamUid, competition.team_uid_prefix || '')) {
    return apiError('INVALID_TEAM_UID', 'Format UID tim tidak valid.', 400)
  }

  const supabase = createServiceClient()
  const profileResult = await ensureTeamProfile(supabase, auth.user, payload)

  if (!profileResult.ok) return profileResult.response

  const { data: team, error: teamError } = await supabase
    .from('competition_teams')
    .select('id, competition_id, team_uid, team_name, leader_user_id, status')
    .eq('team_uid', requestedTeamUid)
    .maybeSingle()

  if (teamError) return apiError('TEAM_LOOKUP_FAILED', 'Gagal mencari tim.', 500)
  if (!team || team.competition_id !== competition.id) return apiError('TEAM_NOT_FOUND', 'Tim tidak ditemukan.', 404)
  if (team.status !== 'draft') return apiError('TEAM_LOCKED', 'Keanggotaan tim sudah dikunci.', 409)

  const existingMembership = await findUserTeamForCompetition(supabase, auth.user.id, competition.id)

  if (existingMembership.error) {
    return apiError('TEAM_LOOKUP_FAILED', 'Gagal memeriksa tim sebelumnya.', 500)
  }

  if (existingMembership.data) {
    return apiError('USER_ALREADY_IN_TEAM', 'Akun ini sudah tergabung dalam tim untuk kompetisi ini.', 409)
  }

  const { profile } = profileResult
  const { data: member, error: memberError } = await supabase
    .from('competition_team_members')
    .insert({
      team_id: team.id,
      user_id: auth.user.id,
      name: profile.full_name,
      email: profile.email,
      phone: profile.phone,
      institution: profile.institution,
      member_role: 'member',
    })
    .select('id, name, email, phone, institution, member_role, joined_at')
    .single()

  if (memberError || !member) {
    if (memberError?.code === '23505') {
      return apiError('USER_ALREADY_IN_TEAM', 'Akun ini sudah tergabung dalam tim ini.', 409)
    }

    return apiError('TEAM_JOIN_FAILED', 'Gagal bergabung ke tim.', 500)
  }

  const { count: recountCount, error: recountError } = await supabase
    .from('competition_team_members')
    .select('id', { count: 'exact', head: true })
    .eq('team_id', team.id)

  if (recountError) {
    await supabase.from('competition_team_members').delete().eq('id', member.id)
    return apiError('TEAM_JOIN_FAILED', 'Gagal memverifikasi kapasitas tim.', 500)
  }

  if ((recountCount || 0) > competition.team_max) {
    await supabase.from('competition_team_members').delete().eq('id', member.id)
    return apiError('TEAM_FULL', 'Tim sudah penuh.', 409)
  }

  return apiSuccess({ team: { id: team.id, team_uid: team.team_uid, team_name: team.team_name, status: team.status }, member }, 201)
}
