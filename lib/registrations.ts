import { createClient } from '@/lib/supabase/server'
import { getCompetitionBySlug, type CompetitionSummary } from '@/lib/competitions'
import { getLatestPaymentsByRegistrationIds, getPaymentDisplayStatus, type PaymentSummary } from '@/lib/payments'
import { createServiceClient } from '@/lib/supabase/server'

export type RegistrationRow = {
  id: string
  team_id?: string
  team_uid?: string
  competition_id: string
  competition_slug?: string
  competition_name?: string
  registration_kind?: 'individual' | 'team' | string
  team_name: string
  team_members: Array<{
    name?: string
    email?: string
    institution?: string
    role?: string
  }>
  status: 'submitted' | 'verified' | 'rejected' | string
  payment_status?: string
  payment?: PaymentSummary
  is_team_leader?: boolean
  team_member_count?: number
  team_min?: number
  team_max?: number
  created_at?: string
  updated_at?: string
}

const fallbackRegistrations: RegistrationRow[] = [
  {
    id: 'reg-fallback-1',
    competition_id: 'robotics-challenge',
    team_name: 'Delta Pulse',
    team_members: [
      { name: 'Alya', email: 'alya@example.com', institution: 'ITB', role: 'Leader' },
      { name: 'Raka', email: 'raka@example.com', institution: 'ITB', role: 'Member' },
    ],
    status: 'submitted',
    created_at: new Date().toISOString(),
  },
  {
    id: 'reg-fallback-2',
    competition_id: 'hackathon-innovation-sprint',
    team_name: 'Nova Grid',
    team_members: [
      { name: 'Nadya', email: 'nadya@example.com', institution: 'ITB', role: 'Leader' },
      { name: 'Bima', email: 'bima@example.com', institution: 'ITB', role: 'Member' },
      { name: 'Sita', email: 'sita@example.com', institution: 'ITB', role: 'Member' },
    ],
    status: 'verified',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
]

export async function getRegistrations() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return process.env.NODE_ENV === 'development' ? fallbackRegistrations : []
  }

  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return []
    }

    const { data, error } = await supabase
      .from('competition_registrations')
      .select('id, competition_id, registration_kind, status, submitted_at, updated_at, competitions(slug, name)')
      .eq('user_id', user.id)
      .order('submitted_at', { ascending: false })
      .limit(10)

    if (error) {
      return []
    }

    const individualPayments = await getLatestPaymentsByRegistrationIds(
      supabase,
      (data || []).map((registration) => registration.id),
    )

    const individualRegistrations = (data || []).map((registration) => {
      const competition = Array.isArray(registration.competitions)
        ? registration.competitions[0]
        : registration.competitions
      const payment = individualPayments.get(registration.id)

      return {
        id: registration.id,
        competition_id: registration.competition_id,
        competition_slug: competition?.slug,
        competition_name: competition?.name,
        registration_kind: registration.registration_kind,
        team_name: competition?.name || 'Registrasi Individu',
        team_members: registration.registration_kind === 'individual' ? [{ role: 'Peserta' }] : [],
        status: registration.status,
        payment_status: getPaymentDisplayStatus(payment),
        payment,
        created_at: registration.submitted_at,
        updated_at: registration.updated_at,
      }
    }) as RegistrationRow[]

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return individualRegistrations
    }

    const serviceSupabase = createServiceClient()
    const { data: memberships, error: membershipsError } = await serviceSupabase
      .from('competition_team_members')
      .select(
        'id, team_id, member_role, competition_teams!inner(id, competition_id, team_uid, team_name, leader_user_id, status, created_at, updated_at, competitions(id, slug, name, team_min, team_max))',
      )
      .eq('user_id', user.id)

    if (membershipsError || !memberships?.length) {
      return individualRegistrations
    }

    const teamIds = memberships.map((membership) => membership.team_id)
    const { data: teamRegistrations } = await serviceSupabase
      .from('competition_registrations')
      .select('id, team_id, registration_kind, status, submitted_at, updated_at')
      .eq('registration_kind', 'team')
      .in('team_id', teamIds)

    const teamPayments = await getLatestPaymentsByRegistrationIds(
      serviceSupabase,
      (teamRegistrations || []).map((registration) => registration.id),
    )
    const registrationsByTeamId = new Map((teamRegistrations || []).map((registration) => [registration.team_id, registration]))
    const teamRows = await Promise.all(
      memberships.map(async (membership) => {
        const team = Array.isArray(membership.competition_teams)
          ? membership.competition_teams[0]
          : membership.competition_teams
        const competition = Array.isArray(team?.competitions) ? team?.competitions[0] : team?.competitions
        const registration = registrationsByTeamId.get(membership.team_id)
        const payment = registration?.id ? teamPayments.get(registration.id) : undefined
        const { count } = await serviceSupabase
          .from('competition_team_members')
          .select('id', { count: 'exact', head: true })
          .eq('team_id', membership.team_id)

        return {
          id: registration?.id || `team-${membership.team_id}`,
          team_id: membership.team_id,
          team_uid: team?.team_uid,
          competition_id: team?.competition_id || '',
          competition_slug: competition?.slug,
          competition_name: competition?.name,
          registration_kind: 'team',
          team_name: team?.team_name || 'Tim',
          team_members: Array.from({ length: count || 0 }, () => ({})),
          status: registration?.status || team?.status || 'draft',
          payment_status: registration ? getPaymentDisplayStatus(payment) : undefined,
          payment,
          is_team_leader: team?.leader_user_id === user.id,
          team_member_count: count || 0,
          team_min: competition?.team_min,
          team_max: competition?.team_max,
          created_at: registration?.submitted_at || team?.created_at,
          updated_at: registration?.updated_at || team?.updated_at,
        } as RegistrationRow
      }),
    )

    return [...individualRegistrations, ...teamRows]
  } catch {
    return []
  }
}

export type CompetitionRow = {
  id: string
  slug: string
  name: string
  registration_type: 'individual' | 'team'
  team_uid_prefix: string | null
  team_min: number
  team_max: number
  registration_open: string | null
  registration_close: string | null
  is_active: boolean
}

function descriptionToText(description: CompetitionSummary['description']) {
  if (typeof description === 'string') return description
  if (!Array.isArray(description)) return null

  const text = description
    .flatMap((block) => (typeof block === 'object' && block && 'children' in block ? (block.children as unknown[]) : []))
    .map((child) => (typeof child === 'object' && child && 'text' in child ? String(child.text) : ''))
    .filter(Boolean)
    .join(' ')

  return text || null
}

export async function findOrCreateCompetitionRow(slug: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: false as const, code: 'SUPABASE_CONFIG_MISSING', message: 'Konfigurasi Supabase server belum lengkap.', status: 500 }
  }

  const competition = await getCompetitionBySlug(slug)

  if (!competition) {
    return { ok: false as const, code: 'COMPETITION_NOT_FOUND', message: 'Kompetisi tidak ditemukan.', status: 404 }
  }

  const supabase = createServiceClient()

  const { data: existingCompetition, error: existingError } = await supabase
    .from('competitions')
    .select('id, slug, name, registration_type, team_uid_prefix, team_min, team_max, registration_open, registration_close, is_active')
    .eq('slug', competition.slug.current)
    .maybeSingle()

  if (existingError) {
    return { ok: false as const, code: 'COMPETITION_LOOKUP_FAILED', message: 'Gagal memuat data kompetisi.', status: 500, error: existingError }
  }

  if (existingCompetition) {
    return { ok: true as const, competition: existingCompetition as CompetitionRow, source: competition }
  }

  const { data, error } = await supabase
    .from('competitions')
    .insert({
      slug: competition.slug.current,
      name: competition.title,
      description: descriptionToText(competition.description),
      category: competition.category || null,
      registration_type: competition.registrationType,
      team_uid_prefix: competition.registrationType === 'team' ? competition.teamUidPrefix || null : null,
      team_min: competition.teamMin || 1,
      team_max: competition.teamMax || 1,
      registration_open: competition.regOpen || null,
      registration_close: competition.regClose || null,
      is_active: true,
    })
    .select('id, slug, name, registration_type, team_uid_prefix, team_min, team_max, registration_open, registration_close, is_active')
    .single()

  if (error) {
    if (error.code === '23505') {
      const { data: raced, error: racedError } = await supabase
        .from('competitions')
        .select('id, slug, name, registration_type, team_uid_prefix, team_min, team_max, registration_open, registration_close, is_active')
        .eq('slug', competition.slug.current)
        .maybeSingle()

      if (racedError || !raced) {
        return { ok: false as const, code: 'COMPETITION_LOOKUP_FAILED', message: 'Gagal memuat data kompetisi.', status: 500, error }
      }

      return { ok: true as const, competition: raced as CompetitionRow, source: competition }
    }

    return { ok: false as const, code: 'COMPETITION_LOOKUP_FAILED', message: 'Gagal memuat data kompetisi.', status: 500, error }
  }

  if (!data) {
    return { ok: false as const, code: 'COMPETITION_LOOKUP_FAILED', message: 'Gagal memuat data kompetisi.', status: 500 }
  }

  return { ok: true as const, competition: data as CompetitionRow, source: competition }
}
