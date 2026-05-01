import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

import { createServiceClient } from '@/lib/supabase'

const resendApiKey = process.env.RESEND_API_KEY
const resendFromEmail = process.env.RESEND_FROM_EMAIL
const resend = resendApiKey ? new Resend(resendApiKey) : null

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

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as RegistrationPayload
    const competitionId = payload.competitionId?.trim()
    const competitionTitle = payload.competitionTitle?.trim() || payload.competitionSlug?.trim() || 'Kompetisi'
    const teamName = payload.teamName?.trim()
    const contactEmail = payload.contactEmail?.trim()
    const teamMembers = Array.isArray(payload.teamMembers) ? payload.teamMembers : []

    if (!competitionId || !teamName || !contactEmail || teamMembers.length === 0) {
      return NextResponse.json(
        { error: 'competitionId, teamName, contactEmail, dan teamMembers wajib diisi' },
        { status: 400 },
      )
    }

    const supabase = createServiceClient()
    const authHeader = request.headers.get('authorization')
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

    let userId: string | null = null
    let emailForNotification = contactEmail

    if (accessToken) {
      const { data, error } = await supabase.auth.getUser(accessToken)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 401 })
      }

      userId = data.user?.id || null
      emailForNotification = data.user?.email || contactEmail
    }

    const { data: registration, error } = await supabase
      .from('registrations')
      .insert({
        user_id: userId,
        competition_id: competitionId,
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
      await resend.emails.send({
        from: resendFromEmail,
        to: emailForNotification,
        subject: `[ITB Insight] Registrasi ${teamName} untuk ${competitionTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a; max-width: 640px; margin: 0 auto;">
            <h2 style="margin-bottom: 16px;">Registrasi berhasil diterima</h2>
            <p>Halo <strong>${teamName}</strong>, pendaftaran untuk <strong>${competitionTitle}</strong> sudah masuk ke sistem.</p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 16px; margin: 24px 0;">
              <p><strong>Status:</strong> Pending</p>
              <p><strong>Jumlah anggota:</strong> ${teamMembers.length}</p>
            </div>
            <p>Tim panitia akan meninjau data dan berkas kalian berikutnya.</p>
          </div>
        `,
      })
    }

    return NextResponse.json({ success: true, registration })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
