import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production' && process.env.MIDTRANS_IS_PRODUCTION === 'true') {
    return NextResponse.json({ error: 'Forbidden in production' }, { status: 403 })
  }

  const origin = new URL(request.url).origin
  const email = 'test-participant@example.com'
  const password = 'Password123!'

  const supabaseService = createServiceClient()

  try {
    // 1. Check if test user exists
    const { data: usersData } = await supabaseService.auth.admin.listUsers()
    let user = usersData?.users?.find(u => u.email === email)

    if (!user) {
      // Create user
      const { data: userData, error: createError } = await supabaseService.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      })
      if (createError) throw createError
      user = userData.user
    }

    // Wait for DB trigger to finish profiling
    await new Promise(resolve => setTimeout(resolve, 500))

    // 2. Fetch paper-competition
    const { data: comp } = await supabaseService
      .from('competitions')
      .select('id')
      .eq('slug', 'paper-competition')
      .single()

    if (comp) {
      // 3. Ensure a registration exists
      const { data: existingReg } = await supabaseService
        .from('competition_registrations')
        .select('id')
        .eq('user_id', user.id)
        .eq('competition_id', comp.id)
        .maybeSingle()

      if (!existingReg) {
        const { data: newReg } = await supabaseService.from('competition_registrations').insert({
          user_id: user.id,
          competition_id: comp.id,
          status: 'submitted',
          registration_kind: 'individual'
        }).select('id').single()
      } else {
        // Clear any existing payments to reset status to unpaid
        await supabaseService.from('payments').delete().eq('registration_id', existingReg.id)
      }
    }

    // 4. Sign in on the client (which sets cookies)
    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (signInError) throw signInError

    return NextResponse.redirect(new URL('/dashboard', origin))
  } catch (err: any) {
    return NextResponse.json({ error: err.message || err }, { status: 500 })
  }
}
