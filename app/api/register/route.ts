import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

import { getCompetitionBySlug } from '@/lib/competitions'

const resendApiKey = process.env.RESEND_API_KEY
const resendFromEmail = process.env.RESEND_FROM_EMAIL
const resend = resendApiKey ? new Resend(resendApiKey) : null

const createServiceClient = () => {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) return null
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

type RegistrationPayload = {
  competitionId?: string
  competitionSlug?: string
  competitionTitle?: string
  teamName?: string
  contactEmail?: string
  teamMembers?: Array<{
    name?: string
    email?: string
    institution?: string
    role?: string
  }>
}

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!)

export async function POST(request: NextRequest) {
  try {
    let payload: RegistrationPayload

    try {
      payload = (await request.json()) as RegistrationPayload
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const competitionId = payload.competitionId?.trim()
    const competitionSlug = payload.competitionSlug?.trim()
    const teamName = payload.teamName?.trim()
    const contactEmail = payload.contactEmail?.trim()
    const teamMembers = Array.isArray(payload.teamMembers)
      ? payload.teamMembers.map((member) => ({
          name: member.name?.trim() || '',
          email: member.email?.trim() || '',
          institution: member.institution?.trim() || '',
          role: member.role === 'Leader' ? 'Leader' : 'Member',
        }))
      : []
    const authHeader = request.headers.get('authorization')
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!competitionId || !competitionSlug || !teamName || !contactEmail || teamMembers.length === 0) {
      return NextResponse.json(
        { error: 'competitionId, competitionSlug, teamName, contactEmail, dan teamMembers wajib diisi' },
        { status: 400 },
      )
    }

    if (!isEmail(contactEmail) || teamMembers.some((member) => !member.name || !isEmail(member.email) || !member.institution)) {
      return NextResponse.json({ error: 'Data anggota tim tidak valid' }, { status: 400 })
    }

    const memberEmails = teamMembers.map((member) => member.email.toLowerCase())
    if (new Set(memberEmails).size !== memberEmails.length) {
      return NextResponse.json({ error: 'Email anggota tidak boleh duplikat' }, { status: 400 })
    }

    if (teamMembers.filter((member) => member.role === 'Leader').length !== 1) {
      return NextResponse.json({ error: 'Tim harus punya tepat 1 Leader' }, { status: 400 })
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({ error: 'Supabase config missing' }, { status: 500 })
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { data, error: userError } = await supabase.auth.getUser(accessToken)

    if (userError || !data.user) {
      return NextResponse.json({ error: userError?.message || 'Unauthorized' }, { status: 401 })
    }

    const competition = await getCompetitionBySlug(competitionSlug)

    if (!competition || competition._id !== competitionId) {
      return NextResponse.json({ error: 'Kompetisi tidak ditemukan' }, { status: 404 })
    }

    const now = Date.now()
    if ((competition.regOpen && new Date(competition.regOpen).getTime() > now) || (competition.regClose && new Date(competition.regClose).getTime() < now)) {
      return NextResponse.json({ error: 'Registrasi kompetisi sedang tidak dibuka' }, { status: 400 })
    }

    const minMembers = competition.teamMin || 1
    const maxMembers = competition.teamMax || 5
    if (teamMembers.length < minMembers || teamMembers.length > maxMembers) {
      return NextResponse.json({ error: `Jumlah anggota harus ${minMembers}-${maxMembers}` }, { status: 400 })
    }

    const { data: dbCompetition } = await supabase
      .from('competitions')
      .select('id')
      .eq('slug', competitionSlug)
      .maybeSingle()

    let dbCompetitionId = dbCompetition?.id || (isUuid(competitionId) ? competitionId : null)

    if (!dbCompetitionId) {
      const service = createServiceClient()
      if (service) {
        const { data: createdCompetition } = await service
          .from('competitions')
          .upsert(
            {
              name: competition.title,
              slug: competition.slug.current,
              description: typeof competition.description === 'string' ? competition.description : null,
              category: competition.category || null,
              team_min: minMembers,
              team_max: maxMembers,
              registration_open: competition.regOpen || null,
              registration_close: competition.regClose || null,
              is_active: true,
            },
            { onConflict: 'slug' },
          )
          .select('id')
          .single()

        dbCompetitionId = createdCompetition?.id || null
      }
    }

    if (!dbCompetitionId) {
      return NextResponse.json({ error: 'Kompetisi belum terhubung ke database. Seed tabel competitions atau set SUPABASE_SERVICE_ROLE_KEY.' }, { status: 400 })
    }

    const service = createServiceClient()
    const duplicateClient = service || supabase
    const { data: existingUserRegistration } = await duplicateClient
      .from('registrations')
      .select('id')
      .eq('competition_id', dbCompetitionId)
      .eq('user_id', data.user.id)
      .maybeSingle()

    if (existingUserRegistration) {
      return NextResponse.json({ error: 'Akun ini sudah terdaftar di kompetisi ini' }, { status: 409 })
    }

    const { data: existingTeamName } = await duplicateClient
      .from('registrations')
      .select('id')
      .eq('competition_id', dbCompetitionId)
      .eq('team_name', teamName)
      .maybeSingle()

    if (existingTeamName) {
      return NextResponse.json({ error: 'Nama tim sudah dipakai di kompetisi ini' }, { status: 409 })
    }

    const { data: registration, error } = await supabase
      .from('registrations')
      .insert({
        user_id: data.user.id,
        competition_id: dbCompetitionId,
        team_name: teamName,
        team_members: teamMembers,
        status: 'pending',
      })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (resend && resendFromEmail) {
      try {
        const { error: emailError } = await resend.emails.send({
          from: resendFromEmail,
          to: data.user.email || contactEmail,
          subject: `[ITB Insight] Registrasi ${teamName} untuk ${competition.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a; max-width: 640px; margin: 0 auto;">
              <h2 style="margin-bottom: 16px;">Registrasi berhasil diterima</h2>
              <p>Halo <strong>${escapeHtml(teamName)}</strong>, pendaftaran untuk <strong>${escapeHtml(competition.title)}</strong> sudah masuk ke sistem.</p>
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 16px; margin: 24px 0;">
                <p><strong>Status:</strong> Pending</p>
                <p><strong>Jumlah anggota:</strong> ${teamMembers.length}</p>
              </div>
              <p>Tim panitia akan meninjau data dan berkas kalian berikutnya.</p>
            </div>
          `,
        })

        if (emailError) console.error('Registration email error:', emailError)
      } catch (emailError) {
        console.error('Registration email error:', emailError)
      }
    }

    return NextResponse.json({ success: true, registration })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
