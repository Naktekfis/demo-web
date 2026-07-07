import { createClient } from '@/lib/supabase/server'
import { getCompetitionBySlug, type CompetitionSummary } from '@/lib/competitions'
import { createServiceClient } from '@/lib/supabase/server'

export type RegistrationRow = {
  id: string
  competition_id: string
  team_name: string
  team_members: Array<{
    name?: string
    email?: string
    institution?: string
    role?: string
  }>
  status: 'pending' | 'verified' | 'rejected' | string
  created_at?: string
  updated_at?: string
}

const fallbackRegistrations: RegistrationRow[] = [
  {
    id: 'reg-demo-1',
    competition_id: 'robotics-demo',
    team_name: 'Delta Pulse',
    team_members: [
      { name: 'Alya', email: 'alya@example.com', institution: 'ITB', role: 'Leader' },
      { name: 'Raka', email: 'raka@example.com', institution: 'ITB', role: 'Member' },
    ],
    status: 'pending',
    created_at: new Date().toISOString(),
  },
  {
    id: 'reg-demo-2',
    competition_id: 'hackathon-demo',
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
      .from('registrations')
      .select('id, competition_id, team_name, team_members, status, created_at, updated_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      return []
    }

    return (data || []) as RegistrationRow[]
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
  const competition = await getCompetitionBySlug(slug)

  if (!competition) {
    return { ok: false as const, code: 'COMPETITION_NOT_FOUND', message: 'Kompetisi tidak ditemukan.', status: 404 }
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('competitions')
    .upsert(
      {
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
      },
      { onConflict: 'slug' },
    )
    .select('id, slug, name, registration_type, team_uid_prefix, team_min, team_max, registration_open, registration_close, is_active')
    .single()

  if (error || !data) {
    return { ok: false as const, code: 'COMPETITION_LOOKUP_FAILED', message: 'Gagal memuat data kompetisi.', status: 500, error }
  }

  return { ok: true as const, competition: data as CompetitionRow, source: competition }
}
