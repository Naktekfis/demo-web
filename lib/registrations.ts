import { createServiceClient, hasSupabaseServiceConfig } from '@/lib/supabase'

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
  if (!hasSupabaseServiceConfig()) {
    return fallbackRegistrations
  }

  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('registrations')
      .select('id, competition_id, team_name, team_members, status, created_at, updated_at')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error || !data?.length) {
      return fallbackRegistrations
    }

    return data as RegistrationRow[]
  } catch {
    return fallbackRegistrations
  }
}
