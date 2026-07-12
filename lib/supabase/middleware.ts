import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function createSupabaseResponse(request: NextRequest) {
  return NextResponse.next({
    request: {
      headers: request.headers,
    },
  })
}

function isMissingRefreshTokenError(error: unknown) {
  if (!error || typeof error !== 'object') return false

  const authError = error as { code?: string; message?: string }
  return authError.code === 'refresh_token_not_found' || authError.message?.includes('Refresh Token Not Found')
}

function clearSupabaseAuthCookies(request: NextRequest, response: NextResponse) {
  request.cookies
    .getAll()
    .filter(({ name }) => name.startsWith('sb-') && (name.includes('auth-token') || name.includes('code-verifier')))
    .forEach(({ name }) => {
      request.cookies.delete(name)
      response.cookies.set(name, '', { maxAge: 0, path: '/' })
    })
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = createSupabaseResponse(request)

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = createSupabaseResponse(request)
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
          Object.entries(headers).forEach(([key, value]) => supabaseResponse.headers.set(key, value))
        },
      },
    }
  )

  let user: unknown = null
  let error: unknown = null

  try {
    const result = await supabase.auth.getUser()
    user = result.data.user
    error = result.error
  } catch (caughtError) {
    if (!isMissingRefreshTokenError(caughtError)) {
      throw caughtError
    }
    error = caughtError
  }

  if (isMissingRefreshTokenError(error)) {
    clearSupabaseAuthCookies(request, supabaseResponse)
  }

  // Protect participant-only pages. Competition list/detail are public; registration lives under /dashboard.
  if (
    !user &&
    request.nextUrl.pathname.startsWith('/dashboard')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search)
    const redirectResponse = NextResponse.redirect(url)
    if (isMissingRefreshTokenError(error)) {
      clearSupabaseAuthCookies(request, redirectResponse)
    }
    return redirectResponse
  }

  return supabaseResponse
}
