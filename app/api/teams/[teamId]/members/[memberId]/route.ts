import { type NextRequest } from 'next/server'

import { apiError, apiSuccess, unauthorizedResponse } from '@/lib/api-response'
import { getAuthenticatedUser } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/server'

type RouteContext = {
  params: Promise<{ teamId: string; memberId: string }>
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const auth = await getAuthenticatedUser(request)

  if (!auth.ok) return unauthorizedResponse()

  const { teamId, memberId } = await context.params
  const supabase = createServiceClient()
  const { data: team, error: teamError } = await supabase
    .from('competition_teams')
    .select('id, leader_user_id, status')
    .eq('id', teamId)
    .maybeSingle()

  if (teamError) return apiError('TEAM_LOOKUP_FAILED', 'Gagal memuat tim.', 500)
  if (!team) return apiError('TEAM_NOT_FOUND', 'Tim tidak ditemukan.', 404)
  if (team.leader_user_id !== auth.user.id) return apiError('TEAM_LEADER_ONLY', 'Hanya leader yang dapat menghapus anggota.', 403)
  if (team.status !== 'draft') return apiError('TEAM_LOCKED', 'Keanggotaan tim sudah dikunci.', 409)

  const { data: member, error: memberError } = await supabase
    .from('competition_team_members')
    .select('id, user_id, member_role')
    .eq('id', memberId)
    .eq('team_id', teamId)
    .maybeSingle()

  if (memberError) return apiError('TEAM_MEMBER_LOOKUP_FAILED', 'Gagal memuat anggota tim.', 500)
  if (!member) return apiError('TEAM_MEMBER_NOT_FOUND', 'Anggota tim tidak ditemukan.', 404)
  if (member.member_role === 'leader') {
    return apiError('LEADER_REMOVE_BLOCKED', 'Leader tidak dapat dihapus dari tim lewat endpoint ini.', 409)
  }

  const { error: deleteError } = await supabase.from('competition_team_members').delete().eq('id', memberId).eq('team_id', teamId)

  if (deleteError) return apiError('TEAM_MEMBER_DELETE_FAILED', 'Gagal menghapus anggota tim.', 500)

  return apiSuccess({ removedMemberId: memberId })
}
