import { type NextRequest } from 'next/server'

import { apiError, apiSuccess, unauthorizedResponse, type ApiErrorCode } from '@/lib/api-response'
import { getAuthenticatedUser } from '@/lib/auth'
import { checkRateLimit, rateLimitResponse, sensitiveMutationRateLimit } from '@/lib/rate-limit'
import { findOrCreateCompetitionRow } from '@/lib/registrations'
import { createServiceClient } from '@/lib/supabase/server'
import { isRegistrationOpen } from '@/lib/team-registration'
import { ensureVisitorTicket } from '@/lib/tickets'

type IndividualRegistrationPayload = {
  competitionSlug?: string
  phoneNumber?: string
}

function logIndividualRegistrationError(context: string, error: unknown) {
  console.error('[individual-registration]', context, error)
}

function individualRegistrationResponse(
  registration: { id: string; status: string; submitted_at: string },
  competitionSlug: string,
  status = 201,
) {
  return apiSuccess(
    {
      registration: {
        id: registration.id,
        competitionSlug,
        registrationKind: 'individual',
        status: registration.status,
        submittedAt: registration.submitted_at,
      },
    },
    status,
  )
}

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUser(request)

  if (!auth.ok) {
    return unauthorizedResponse()
  }

  const rateLimit = checkRateLimit(request, {
    scope: 'registration-individual',
    identity: auth.user.id,
    ...sensitiveMutationRateLimit,
  })

  if (!rateLimit.allowed) return rateLimitResponse(rateLimit.retryAfterSeconds)

  let payload: IndividualRegistrationPayload

  try {
    payload = (await request.json()) as IndividualRegistrationPayload
  } catch {
    return apiError('INVALID_JSON', 'Format request tidak valid.', 400)
  }

  const competitionSlug = payload.competitionSlug?.trim()
  const phoneNumber = payload.phoneNumber?.trim()

  if (!competitionSlug) {
    return apiError('COMPETITION_REQUIRED', 'Kompetisi wajib dipilih.', 400)
  }

  const competitionResult = await findOrCreateCompetitionRow(competitionSlug)

  if (!competitionResult.ok) {
    if (competitionResult.status >= 500) {
      logIndividualRegistrationError('competition lookup failed', competitionResult)
    }

    return apiError(competitionResult.code as ApiErrorCode, competitionResult.message, competitionResult.status)
  }

  const { competition } = competitionResult

  if (!competition.is_active) {
    return apiError('REGISTRATION_CLOSED', 'Registrasi kompetisi sedang tidak dibuka.', 400)
  }

  if (competition.registration_type !== 'individual') {
    return apiError('INVALID_COMPETITION_TYPE', 'Kompetisi ini memakai alur registrasi tim.', 400)
  }

  if (!isRegistrationOpen(competition.registration_open, competition.registration_close)) {
    return apiError('REGISTRATION_CLOSED', 'Registrasi kompetisi sedang tidak dibuka.', 400)
  }

  const supabase = createServiceClient()
  const userEmail = auth.user.email || ''
  const userName =
    typeof auth.user.user_metadata?.full_name === 'string' && auth.user.user_metadata.full_name.trim()
      ? auth.user.user_metadata.full_name.trim()
      : userEmail || 'Visitor'

  const { data: existingProfile, error: existingProfileError } = await supabase
    .from('profiles')
    .select('id, phone')
    .eq('id', auth.user.id)
    .maybeSingle()

  if (existingProfileError) {
    logIndividualRegistrationError('profile lookup failed', existingProfileError)
    return apiError('PROFILE_REQUIRED', 'Profil pengguna belum siap. Silakan coba lagi.', 500)
  }

  const { data: profile, error: profileError } = existingProfile
    ? { data: existingProfile, error: null }
    : await supabase
        .from('profiles')
        .insert({
          id: auth.user.id,
          full_name: userName,
          email: userEmail,
        })
        .select('id, phone')
        .single()

  if (profileError || !profile) {
    logIndividualRegistrationError('profile create failed', profileError)
    return apiError('PROFILE_REQUIRED', 'Profil pengguna belum siap. Silakan coba lagi.', 500)
  }

  if (!profile.phone?.trim() && phoneNumber) {
    const { data: updatedProfile, error: updateProfileError } = await supabase
      .from('profiles')
      .update({ phone: phoneNumber })
      .eq('id', auth.user.id)
      .select('id, phone')
      .single()

    if (updateProfileError || !updatedProfile?.phone?.trim()) {
      logIndividualRegistrationError('profile phone update failed', updateProfileError)
      return apiError('PROFILE_UPDATE_FAILED', 'Gagal menyimpan nomor telepon profil.', 500)
    }
  }

  if (!profile.phone?.trim() && !phoneNumber) {
    return apiError('PHONE_REQUIRED', 'Nomor telepon wajib dilengkapi sebelum mendaftar kompetisi.', 400)
  }

  const ticketResult = await ensureVisitorTicket(auth.user.id, supabase)

  if (!ticketResult.ok) {
    logIndividualRegistrationError('ticket ensure failed', ticketResult.error)
    return apiError('TICKET_ENSURE_FAILED', 'Gagal memastikan tiket pengunjung.', 500)
  }

  const { data: existingRegistration, error: existingError } = await supabase
    .from('competition_registrations')
    .select('id, status, submitted_at')
    .eq('competition_id', competition.id)
    .eq('user_id', auth.user.id)
    .eq('registration_kind', 'individual')
    .maybeSingle()

  if (existingError) {
    logIndividualRegistrationError('registration lookup failed', existingError)
    return apiError('REGISTRATION_LOOKUP_FAILED', 'Gagal memeriksa registrasi sebelumnya.', 500)
  }

  if (existingRegistration) {
    return individualRegistrationResponse(existingRegistration, competition.slug, 200)
  }

  const { data: registration, error: insertError } = await supabase
    .from('competition_registrations')
    .insert({
      competition_id: competition.id,
      registration_kind: 'individual',
      user_id: auth.user.id,
      status: 'submitted',
    })
    .select('id, status, submitted_at')
    .single()

  if (insertError || !registration) {
    if (insertError?.code === '23505') {
      const { data: racedRegistration, error: racedError } = await supabase
        .from('competition_registrations')
        .select('id, status, submitted_at')
        .eq('competition_id', competition.id)
        .eq('user_id', auth.user.id)
        .eq('registration_kind', 'individual')
        .maybeSingle()

      if (!racedError && racedRegistration) {
        return individualRegistrationResponse(racedRegistration, competition.slug, 200)
      }

      return apiError('DUPLICATE_REGISTRATION', 'Akun ini sudah terdaftar di kompetisi ini.', 409)
    }

    logIndividualRegistrationError('registration create failed', insertError)
    return apiError('REGISTRATION_CREATE_FAILED', 'Gagal menyimpan registrasi kompetisi.', 500)
  }

  return individualRegistrationResponse(registration, competition.slug)
}
