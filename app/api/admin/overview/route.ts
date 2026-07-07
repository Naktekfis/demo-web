import { type NextRequest } from 'next/server'

import { apiError, apiSuccess } from '@/lib/api-response'
import { getAdminUser } from '@/lib/admin'
import { listAdminRegistrations } from '@/lib/admin-registrations'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const admin = await getAdminUser(request)
  if (!admin.ok) return apiError(admin.code, admin.message, admin.status)

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return apiError('SERVER_CONFIG_MISSING', 'Konfigurasi server admin belum lengkap.', 500)
  }

  try {
    const supabase = createServiceClient()
    const [ticketsCountResult, checkedInCountResult, teamsCountResult, registrationsPage] = await Promise.all([
      supabase.from('visitor_tickets').select('id', { count: 'exact', head: true }),
      supabase.from('visitor_tickets').select('id', { count: 'exact', head: true }).eq('checked_in', true),
      supabase.from('competition_teams').select('id', { count: 'exact', head: true }),
      listAdminRegistrations(supabase, {}, { page: 1, pageSize: 1000 }),
    ])

    if (ticketsCountResult.error) throw ticketsCountResult.error
    if (checkedInCountResult.error) throw checkedInCountResult.error
    if (teamsCountResult.error) throw teamsCountResult.error

    const registrations = registrationsPage.items

    return apiSuccess({
      metrics: {
        totalVisitors: ticketsCountResult.count || 0,
        totalCheckedInVisitors: checkedInCountResult.count || 0,
        totalRegistrations: registrationsPage.total,
        totalTeams: teamsCountResult.count || 0,
        pendingRegistrations: registrations.filter((registration) => registration.status === 'pending').length,
        verifiedRegistrations: registrations.filter((registration) => registration.status === 'verified').length,
        rejectedRegistrations: registrations.filter((registration) => registration.status === 'rejected').length,
        perCompetition: Object.values(
          registrations.reduce<Record<string, { competitionSlug: string; competitionName: string; count: number }>>((acc, registration) => {
            const key = registration.competitionSlug
            acc[key] ||= { competitionSlug: key, competitionName: registration.competitionName, count: 0 }
            acc[key].count += 1
            return acc
          }, {}),
        ),
      },
    })
  } catch {
    return apiError('ADMIN_OVERVIEW_FAILED', 'Gagal memuat ringkasan admin.', 500)
  }
}
