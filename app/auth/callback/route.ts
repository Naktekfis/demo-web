import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ensureVisitorTicket } from '@/lib/tickets'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const rawNext = searchParams.get('next') ?? '/dashboard'
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/dashboard'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data } = await supabase.auth.getUser()

      if (data.user && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        try {
          await ensureVisitorTicket(data.user.id)
        } catch {
          // Ticket page calls the same ensure endpoint as a fallback, so auth must not be blocked here.
        }
      }

      return NextResponse.redirect(new URL(next, origin))
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(new URL('/auth/login?error=auth-code', origin))
}
