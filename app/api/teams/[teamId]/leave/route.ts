import { type NextRequest } from 'next/server'

import { apiError, apiSuccess, unauthorizedResponse } from '@/lib/api-response'
import { getAuthenticatedUser } from '@/lib/auth'
import { checkRateLimit, rateLimitResponse, sensitiveMutationRateLimit } from '@/lib/rate-limit'
import { createServiceClient } from '@/lib/supabase/server'

type RouteContext = {
  params: Promise<{ teamId: string }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  const auth = await getAuthenticatedUser(request)

  if (!auth.ok) return unauthorizedResponse()

  const rateLimit = checkRateLimit(request, {
    scope: 'team-leave',
    identity: auth.user.id,
    ...sensitiveMutationRateLimit,
  })

  if (!rateLimit.allowed) return rateLimitResponse(rateLimit.retryAfterSeconds)

  const { teamId } = await context.params
  const supabase = createServiceClient()
  const { data: team, error: teamError } = await supabase
    .from('competition_teams')
    .select('id, leader_user_id, status')
    .eq('id', teamId)
    .maybeSingle()

  if (teamError) return apiError('TEAM_LOOKUP_FAILED', 'Gagal memuat tim.', 500)
  if (!team) return apiError('TEAM_NOT_FOUND', 'Tim tidak ditemukan.', 404)
  if (team.status !== 'draft') return apiError('TEAM_LOCKED', 'Keanggotaan tim sudah dikunci.', 409)
  if (team.leader_user_id === auth.user.id) return apiError('LEADER_LEAVE_BLOCKED', 'Leader tidak dapat keluar dari tim.', 409)

  const { data: member, error: memberError } = await supabase
    .from('competition_team_members')
    .select('id')
    .eq('team_id', teamId)
    .eq('user_id', auth.user.id)
    .maybeSingle()

  if (memberError) return apiError('TEAM_MEMBER_LOOKUP_FAILED', 'Gagal memuat anggota tim.', 500)
  if (!member) return apiError('TEAM_MEMBER_NOT_FOUND', 'Akun ini belum tergabung dalam tim.', 404)

  const { error: deleteError } = await supabase.from('competition_team_members').delete().eq('id', member.id)

  if (deleteError) return apiError('TEAM_LEAVE_FAILED', 'Gagal keluar dari tim.', 500)

  return apiSuccess({ leftTeamId: teamId })
}
