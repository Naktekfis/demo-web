import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
if (!anonKey) console.warn('WARNING: NEXT_PUBLIC_SUPABASE_ANON_KEY not set — client may be limited')

const supabaseUrl = url

export const supabase = createClient(supabaseUrl, anonKey || '')

export function hasSupabaseConfig() {
  return Boolean(url && anonKey)
}

export function hasSupabaseServiceConfig() {
  return Boolean(url && serviceKey)
}

export function createServiceClient(): SupabaseClient {
  if (!serviceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY for service client')
  return createClient(supabaseUrl, serviceKey)
}

/**
 * Update the Supabase session in middleware
 * Refreshes the auth token and updates cookies
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseClient = createClient(supabaseUrl, anonKey || '', {
    global: {
      headers: {
        cookie: request.cookies.toString(),
      },
    },
  })

  const { data } = await supabaseClient.auth.getSession()

  // Set response cookies from Supabase
  const authCookie = request.cookies.get('sb-auth-token')
  if (authCookie) {
    response.cookies.set('sb-auth-token', authCookie.value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
  }

  return response
}

export default supabase
