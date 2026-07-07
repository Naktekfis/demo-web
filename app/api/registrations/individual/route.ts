import { type NextRequest } from 'next/server'

import { apiError, apiSuccess, unauthorizedResponse, type ApiErrorCode } from '@/lib/api-response'
import { getAuthenticatedUser } from '@/lib/auth'
import { findOrCreateCompetitionRow } from '@/lib/registrations'
import { createServiceClient } from '@/lib/supabase/server'
import { ensureVisitorTicket } from '@/lib/tickets'

type IndividualRegistrationPayload = {
  competitionSlug?: string
  phoneNumber?: string
}

function isRegistrationOpen(registrationOpen: string | null, registrationClose: string | null) {
  const now = Date.now()
  const opensAt = registrationOpen ? new Date(registrationOpen).getTime() : null
  const closesAt = registrationClose ? new Date(registrationClose).getTime() : null

  if ((opensAt !== null && Number.isNaN(opensAt)) || (closesAt !== null && Number.isNaN(closesAt))) {
    return false
  }

  return (opensAt === null || opensAt <= now) && (closesAt === null || closesAt >= now)
}

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUser(request)

  if (!auth.ok) {
    return unauthorizedResponse()
  }

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
    return apiError('PROFILE_REQUIRED', 'Profil pengguna belum siap. Silakan coba lagi.', 500)
  }

  const { data: profileWithPhone, error: phoneProfileError } = await supabase
    .from('profiles')
    .select('id, phone')
    .eq('id', profile.id)
    .single()

  if (phoneProfileError || !profileWithPhone) {
    return apiError('PROFILE_REQUIRED', 'Profil pengguna belum siap. Silakan coba lagi.', 500)
  }

  if (!profileWithPhone.phone?.trim() && phoneNumber) {
    const { data: updatedProfile, error: updateProfileError } = await supabase
      .from('profiles')
      .update({ phone: phoneNumber })
      .eq('id', auth.user.id)
      .select('id, phone')
      .single()

    if (updateProfileError || !updatedProfile?.phone?.trim()) {
      return apiError('PROFILE_UPDATE_FAILED', 'Gagal menyimpan nomor telepon profil.', 500)
    }
  }

  if (!profileWithPhone.phone?.trim() && !phoneNumber) {
    return apiError('PHONE_REQUIRED', 'Nomor telepon wajib dilengkapi sebelum mendaftar kompetisi.', 400)
  }

  const ticketResult = await ensureVisitorTicket(auth.user.id, supabase)

  if (!ticketResult.ok) {
    return apiError('TICKET_ENSURE_FAILED', 'Gagal memastikan tiket pengunjung.', 500)
  }

  const { data: existingRegistration, error: existingError } = await supabase
    .from('competition_registrations')
    .select('id')
    .eq('competition_id', competition.id)
    .eq('user_id', auth.user.id)
    .eq('registration_kind', 'individual')
    .maybeSingle()

  if (existingError) {
    return apiError('REGISTRATION_LOOKUP_FAILED', 'Gagal memeriksa registrasi sebelumnya.', 500)
  }

  if (existingRegistration) {
    return apiError('DUPLICATE_REGISTRATION', 'Akun ini sudah terdaftar di kompetisi ini.', 409)
  }

  const { data: registration, error: insertError } = await supabase
    .from('competition_registrations')
    .insert({
      competition_id: competition.id,
      registration_kind: 'individual',
      user_id: auth.user.id,
      status: 'pending',
    })
    .select('id, status, submitted_at')
    .single()

  if (insertError || !registration) {
    if (insertError?.code === '23505') {
      return apiError('DUPLICATE_REGISTRATION', 'Akun ini sudah terdaftar di kompetisi ini.', 409)
    }

    return apiError('REGISTRATION_CREATE_FAILED', 'Gagal menyimpan registrasi kompetisi.', 500)
  }

  return apiSuccess(
    {
      registration: {
        id: registration.id,
        competitionSlug: competition.slug,
        registrationKind: 'individual',
        status: registration.status,
        submittedAt: registration.submitted_at,
      },
    },
    201,
  )
}
