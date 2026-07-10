import { createHash } from 'crypto'
import { type NextRequest, NextResponse } from 'next/server'

import { type ApiErrorEnvelope } from '@/lib/api-response'

type RateLimitScope =
  | 'admin-check-in'
  | 'admin-registration-export'
  | 'admin-registration-status'
  | 'payment-create'
  | 'registration-individual'
  | 'registration-team'
  | 'team-create'
  | 'team-member-remove'
  | 'team-leave'
  | 'team-join'

type RateLimitOptions = {
  readonly scope: RateLimitScope
  readonly identity: string
  readonly limit: number
  readonly windowMs: number
}

type RateLimitBucket = {
  readonly resetAt: number
  count: number
}

type RateLimitBlocked = {
  readonly allowed: false
  readonly retryAfterSeconds: number
}

type RateLimitAllowed = {
  readonly allowed: true
}

type RateLimitResult = RateLimitAllowed | RateLimitBlocked

const buckets = new Map<string, RateLimitBucket>()

export const sensitiveMutationRateLimit = {
  limit: 20,
  windowMs: 60_000,
} as const

export const adminHeavyRateLimit = {
  limit: 10,
  windowMs: 60_000,
} as const

function hashedValue(value: string) {
  return createHash('sha256').update(value).digest('hex').slice(0, 24)
}

function requestIpKey(request: NextRequest) {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const realIp = request.headers.get('x-real-ip')?.trim()
  return hashedValue(forwardedFor || realIp || 'unknown-ip')
}

function consumeBucket(key: string, now: number, options: Pick<RateLimitOptions, 'limit' | 'windowMs'>): RateLimitResult {
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs })
    return { allowed: true }
  }

  if (bucket.count >= options.limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) }
  }

  bucket.count += 1
  return { allowed: true }
}

export function checkRateLimit(request: NextRequest, options: RateLimitOptions): RateLimitResult {
  const now = Date.now()
  const identityKey = `${options.scope}:user:${hashedValue(options.identity)}`
  const ipKey = `${options.scope}:ip:${requestIpKey(request)}`
  const identityResult = consumeBucket(identityKey, now, options)

  if (!identityResult.allowed) return identityResult

  return consumeBucket(ipKey, now, options)
}

export function rateLimitResponse(retryAfterSeconds: number) {
  return NextResponse.json<ApiErrorEnvelope>(
    {
      success: false,
      data: null,
      error: {
        code: 'RATE_LIMITED',
        message: 'Terlalu banyak percobaan. Silakan coba lagi nanti.',
      },
    },
    {
      status: 429,
      headers: { 'Retry-After': String(retryAfterSeconds) },
    },
  )
}
