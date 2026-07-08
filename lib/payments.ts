import { type SupabaseClient } from '@supabase/supabase-js'

import { getCompetitionBySlug } from '@/lib/competitions'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'expired' | 'cancelled'

export type PaymentSummary = {
  id: string
  registration_id: string
  provider: 'mock' | 'midtrans' | string
  status: PaymentStatus | string
  amount: number
  currency: string
  paid_at: string | null
  expired_at: string | null
  created_at: string
  updated_at: string
}

export type PaymentRegistration = {
  id: string
  status: string
  registration_kind: 'individual' | 'team' | string
  user_id: string | null
  team_id: string | null
  competitions:
    | { id: string; slug: string; name: string }
    | Array<{ id: string; slug: string; name: string }>
    | null
  competition_teams:
    | { id: string; leader_user_id: string; team_uid: string; team_name: string }
    | Array<{ id: string; leader_user_id: string; team_uid: string; team_name: string }>
    | null
}

export type AuthorizedPaymentRegistration = {
  id: string
  status: string
  registrationKind: 'individual' | 'team' | string
  competitionSlug: string | null
  competitionName: string | null
  teamId: string | null
  teamUid: string | null
  teamName: string | null
}

export const DEFAULT_PAYMENT_AMOUNT = 10000

export async function getLatestPaymentsByRegistrationIds(supabase: SupabaseClient, registrationIds: string[]) {
  const uniqueIds = Array.from(new Set(registrationIds.filter(Boolean)))
  const paymentsByRegistrationId = new Map<string, PaymentSummary>()

  if (uniqueIds.length === 0) return paymentsByRegistrationId

  const { data, error } = await supabase
    .from('payments')
    .select('id, registration_id, provider, status, amount, currency, paid_at, expired_at, created_at, updated_at')
    .in('registration_id', uniqueIds)
    .order('created_at', { ascending: false })

  if (error) return paymentsByRegistrationId

  for (const payment of (data || []) as PaymentSummary[]) {
    if (!paymentsByRegistrationId.has(payment.registration_id)) {
      paymentsByRegistrationId.set(payment.registration_id, payment)
    }
  }

  return paymentsByRegistrationId
}

export function getPaymentDisplayStatus(payment: PaymentSummary | undefined) {
  return payment?.status || 'unpaid'
}

function firstRelation<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] : value || null
}

export async function getRegistrationPaymentAmount(competitionSlug: string | null | undefined) {
  if (!competitionSlug) return DEFAULT_PAYMENT_AMOUNT

  const competition = await getCompetitionBySlug(competitionSlug)
  const configuredAmount = (competition as { registrationFee?: unknown } | null)?.registrationFee

  if (typeof configuredAmount === 'number' && Number.isFinite(configuredAmount) && configuredAmount >= 0) {
    return Math.round(configuredAmount)
  }

  return DEFAULT_PAYMENT_AMOUNT
}

export async function getAuthorizedPaymentRegistration(
  supabase: SupabaseClient,
  registrationId: string,
  userId: string,
) {
  const { data, error } = await supabase
    .from('competition_registrations')
    .select(
      'id, status, registration_kind, user_id, team_id, competitions(id, slug, name), competition_teams(id, leader_user_id, team_uid, team_name)',
    )
    .eq('id', registrationId)
    .maybeSingle()

  if (error) {
    return { ok: false as const, code: 'REGISTRATION_LOOKUP_FAILED', message: 'Gagal memuat registrasi.', status: 500 }
  }

  if (!data) {
    return { ok: false as const, code: 'REGISTRATION_NOT_FOUND', message: 'Registrasi tidak ditemukan.', status: 404 }
  }

  const registration = data as PaymentRegistration
  const competition = firstRelation(registration.competitions)
  const team = firstRelation(registration.competition_teams)
  const isIndividualOwner = registration.registration_kind === 'individual' && registration.user_id === userId
  const isTeamLeader = registration.registration_kind === 'team' && team?.leader_user_id === userId

  if (!isIndividualOwner && !isTeamLeader) {
    return { ok: false as const, code: 'PAYMENT_FORBIDDEN', message: 'Akun ini tidak berhak mengelola pembayaran registrasi ini.', status: 403 }
  }

  return {
    ok: true as const,
    registration: {
      id: registration.id,
      status: registration.status,
      registrationKind: registration.registration_kind,
      competitionSlug: competition?.slug || null,
      competitionName: competition?.name || null,
      teamId: registration.team_id,
      teamUid: team?.team_uid || null,
      teamName: team?.team_name || null,
    } satisfies AuthorizedPaymentRegistration,
  }
}

export async function getPaymentById(supabase: SupabaseClient, paymentId: string) {
  const { data, error } = await supabase
    .from('payments')
    .select('id, registration_id, provider, status, amount, currency, paid_at, expired_at, created_at, updated_at')
    .eq('id', paymentId)
    .maybeSingle()

  if (error) {
    return { ok: false as const, code: 'PAYMENT_LOOKUP_FAILED', message: 'Gagal memuat pembayaran.', status: 500 }
  }

  if (!data) {
    return { ok: false as const, code: 'PAYMENT_NOT_FOUND', message: 'Pembayaran tidak ditemukan.', status: 404 }
  }

  return { ok: true as const, payment: data as PaymentSummary }
}
