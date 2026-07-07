import { type SupabaseClient } from '@supabase/supabase-js'

export type AdminRegistrationStatus = 'pending' | 'verified' | 'rejected'
export type AdminRegistrationKind = 'individual' | 'team'
export type AdminCheckInStatus = 'checked_in' | 'not_checked_in'

type RegistrationRow = {
  id: string
  competition_id: string
  registration_kind: AdminRegistrationKind
  user_id: string | null
  team_id: string | null
  status: AdminRegistrationStatus
  note: string | null
  submitted_at: string
  updated_at: string
}

type CompetitionRow = {
  id: string
  slug: string
  name: string
}

type ProfileRow = {
  id: string
  full_name: string
  email: string
  phone: string | null
  institution: string | null
}

type TeamRow = {
  id: string
  team_uid: string
  team_name: string
  leader_user_id: string
}

type TeamMemberRow = {
  id: string
  team_id: string
  user_id: string
  name: string
  email: string
  phone: string
  institution: string
  member_role: 'leader' | 'member'
}

type TicketRow = {
  user_id: string
  qr_code: string
  checked_in: boolean
  checked_in_at: string | null
}

export type AdminRegistrationMember = {
  id: string
  userId: string
  role: string
  name: string
  email: string
  phone: string
  institution: string
  qrCode: string
  checkedIn: boolean
  checkedInAt: string | null
}

export type AdminRegistrationItem = {
  id: string
  competitionId: string
  competitionSlug: string
  competitionName: string
  registrationKind: AdminRegistrationKind
  status: AdminRegistrationStatus
  note: string
  submittedAt: string
  updatedAt: string
  teamId: string
  teamName: string
  teamUid: string
  primaryContact: AdminRegistrationMember
  members: AdminRegistrationMember[]
  checkedIn: boolean
  checkedInAt: string | null
}

export type AdminRegistrationFilters = {
  q?: string
  competitionSlug?: string
  registrationType?: string
  status?: string
  checkInStatus?: string
}

export type AdminRegistrationPage = {
  items: AdminRegistrationItem[]
  page: number
  pageSize: number
  total: number
}

const emptyMember: AdminRegistrationMember = {
  id: '',
  userId: '',
  role: 'peserta',
  name: '-',
  email: '-',
  phone: '-',
  institution: '-',
  qrCode: '',
  checkedIn: false,
  checkedInAt: null,
}

function unique(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter(Boolean) as string[]))
}

function contains(value: string | null | undefined, query: string) {
  return (value || '').toLowerCase().includes(query)
}

function normalizePage(value: string | number | undefined, fallback: number, min: number, max: number) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(Math.max(Math.floor(parsed), min), max)
}

function makeMemberFromProfile(profile: ProfileRow | undefined, ticket: TicketRow | undefined): AdminRegistrationMember {
  return {
    id: profile?.id || '',
    userId: profile?.id || '',
    role: 'peserta',
    name: profile?.full_name || '-',
    email: profile?.email || '-',
    phone: profile?.phone || '-',
    institution: profile?.institution || '-',
    qrCode: ticket?.qr_code || '',
    checkedIn: Boolean(ticket?.checked_in),
    checkedInAt: ticket?.checked_in_at || null,
  }
}

function makeMemberFromTeamRow(member: TeamMemberRow, ticket: TicketRow | undefined): AdminRegistrationMember {
  return {
    id: member.id,
    userId: member.user_id,
    role: member.member_role,
    name: member.name || '-',
    email: member.email || '-',
    phone: member.phone || '-',
    institution: member.institution || '-',
    qrCode: ticket?.qr_code || '',
    checkedIn: Boolean(ticket?.checked_in),
    checkedInAt: ticket?.checked_in_at || null,
  }
}

function itemMatchesFilters(item: AdminRegistrationItem, filters: AdminRegistrationFilters) {
  if (filters.competitionSlug && item.competitionSlug !== filters.competitionSlug) return false
  if (filters.registrationType && item.registrationKind !== filters.registrationType) return false
  if (filters.status && item.status !== filters.status) return false

  if (filters.checkInStatus === 'checked_in' && !item.checkedIn) return false
  if (filters.checkInStatus === 'not_checked_in' && item.checkedIn) return false

  const query = filters.q?.trim().toLowerCase()
  if (!query) return true

  return (
    contains(item.competitionName, query) ||
    contains(item.competitionSlug, query) ||
    contains(item.teamName, query) ||
    contains(item.teamUid, query) ||
    item.members.some(
      (member) =>
        contains(member.name, query) ||
        contains(member.email, query) ||
        contains(member.phone, query) ||
        contains(member.qrCode, query),
    )
  )
}

export async function listAdminRegistrations(
  supabase: SupabaseClient,
  filters: AdminRegistrationFilters = {},
  pagination: { page?: string | number; pageSize?: string | number } = {},
): Promise<AdminRegistrationPage> {
  const page = normalizePage(pagination.page, 1, 1, 9999)
  const pageSize = normalizePage(pagination.pageSize, 25, 1, 1000)

  const { data: registrationRows, error: registrationError } = await supabase
    .from('competition_registrations')
    .select('id, competition_id, registration_kind, user_id, team_id, status, note, submitted_at, updated_at')
    .order('submitted_at', { ascending: false })

  if (registrationError) throw registrationError

  const registrations = (registrationRows || []) as RegistrationRow[]
  const competitionIds = unique(registrations.map((registration) => registration.competition_id))
  const teamIds = unique(registrations.map((registration) => registration.team_id))
  const individualUserIds = unique(registrations.map((registration) => registration.user_id))

  const [competitionsResult, teamsResult, membersResult] = await Promise.all([
    competitionIds.length
      ? supabase.from('competitions').select('id, slug, name').in('id', competitionIds)
      : Promise.resolve({ data: [], error: null }),
    teamIds.length
      ? supabase.from('competition_teams').select('id, team_uid, team_name, leader_user_id').in('id', teamIds)
      : Promise.resolve({ data: [], error: null }),
    teamIds.length
      ? supabase
          .from('competition_team_members')
          .select('id, team_id, user_id, name, email, phone, institution, member_role')
          .in('team_id', teamIds)
      : Promise.resolve({ data: [], error: null }),
  ])

  if (competitionsResult.error) throw competitionsResult.error
  if (teamsResult.error) throw teamsResult.error
  if (membersResult.error) throw membersResult.error

  const competitions = new Map(((competitionsResult.data || []) as CompetitionRow[]).map((competition) => [competition.id, competition]))
  const teams = new Map(((teamsResult.data || []) as TeamRow[]).map((team) => [team.id, team]))
  const members = (membersResult.data || []) as TeamMemberRow[]
  const membersByTeamId = new Map<string, TeamMemberRow[]>()
  for (const member of members) {
    membersByTeamId.set(member.team_id, [...(membersByTeamId.get(member.team_id) || []), member])
  }

  const userIds = unique([...individualUserIds, ...members.map((member) => member.user_id)])
  const [profilesResult, ticketsResult] = await Promise.all([
    userIds.length
      ? supabase.from('profiles').select('id, full_name, email, phone, institution').in('id', userIds)
      : Promise.resolve({ data: [], error: null }),
    userIds.length
      ? supabase.from('visitor_tickets').select('user_id, qr_code, checked_in, checked_in_at').in('user_id', userIds)
      : Promise.resolve({ data: [], error: null }),
  ])

  if (profilesResult.error) throw profilesResult.error
  if (ticketsResult.error) throw ticketsResult.error

  const profiles = new Map(((profilesResult.data || []) as ProfileRow[]).map((profile) => [profile.id, profile]))
  const tickets = new Map(((ticketsResult.data || []) as TicketRow[]).map((ticket) => [ticket.user_id, ticket]))

  const items = registrations.map((registration) => {
    const competition = competitions.get(registration.competition_id)
    const team = registration.team_id ? teams.get(registration.team_id) : undefined
    const teamMembers = registration.team_id ? membersByTeamId.get(registration.team_id) || [] : []
    const sortedTeamMembers = [...teamMembers].sort((a, b) => {
      if (a.member_role === b.member_role) return a.name.localeCompare(b.name)
      return a.member_role === 'leader' ? -1 : 1
    })
    const mappedMembers =
      registration.registration_kind === 'team'
        ? sortedTeamMembers.map((member) => makeMemberFromTeamRow(member, tickets.get(member.user_id)))
        : [makeMemberFromProfile(registration.user_id ? profiles.get(registration.user_id) : undefined, registration.user_id ? tickets.get(registration.user_id) : undefined)]
    const primaryContact = mappedMembers.find((member) => member.role === 'leader') || mappedMembers[0] || emptyMember

    return {
      id: registration.id,
      competitionId: registration.competition_id,
      competitionSlug: competition?.slug || registration.competition_id,
      competitionName: competition?.name || registration.competition_id,
      registrationKind: registration.registration_kind,
      status: registration.status,
      note: registration.note || '',
      submittedAt: registration.submitted_at,
      updatedAt: registration.updated_at,
      teamId: registration.team_id || '',
      teamName: team?.team_name || '',
      teamUid: team?.team_uid || '',
      primaryContact,
      members: mappedMembers,
      checkedIn: mappedMembers.some((member) => member.checkedIn),
      checkedInAt: mappedMembers.find((member) => member.checkedIn)?.checkedInAt || null,
    } satisfies AdminRegistrationItem
  })

  const filteredItems = items.filter((item) => itemMatchesFilters(item, filters))
  const start = (page - 1) * pageSize

  return {
    items: filteredItems.slice(start, start + pageSize),
    page,
    pageSize,
    total: filteredItems.length,
  }
}

export async function getAdminRegistrationById(supabase: SupabaseClient, id: string) {
  const page = await listAdminRegistrations(supabase, {}, { page: 1, pageSize: 1000 })
  return page.items.find((item) => item.id === id) || null
}

function csvCell(value: string | number | boolean | null | undefined) {
  const text = value == null ? '' : String(value)
  return `"${text.replace(/"/g, '""')}"`
}

export function adminRegistrationsToCsv(items: AdminRegistrationItem[]) {
  const headers = [
    'competition_name',
    'competition_slug',
    'registration_type',
    'registration_status',
    'team_name',
    'team_uid',
    'member_role',
    'member_name',
    'member_email',
    'member_phone',
    'institution',
    'submitted_at',
    'checked_in',
    'checked_in_at',
  ]
  const rows = items.flatMap((item) =>
    item.members.map((member) => [
      item.competitionName,
      item.competitionSlug,
      item.registrationKind,
      item.status,
      item.teamName,
      item.teamUid,
      member.role,
      member.name,
      member.email,
      member.phone,
      member.institution,
      item.submittedAt,
      member.checkedIn,
      member.checkedInAt,
    ]),
  )

  return [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\n')
}
