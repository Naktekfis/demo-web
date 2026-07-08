import Link from 'next/link'
import { ClipboardList, CheckCircle2, Clock, AlertCircle, ArrowRight } from 'lucide-react'

import { NeuralDashboard } from '@/components/dashboard/neural-dashboard'
import { PaymentActionButton } from '@/components/dashboard/payment-action-button'
import { TeamSubmitButton } from '@/components/dashboard/team-submit-button'
import { Button } from '@/components/ui/button'
import { getRegistrations } from '@/lib/registrations'

export const dynamic = 'force-dynamic'

const statusConfig: Record<string, { icon: any; color: string; label: string; bg: string }> = {
  submitted: {
    icon: Clock,
    color: 'text-amber-700',
    label: 'Submitted',
    bg: 'bg-amber-50 border-amber-200',
  },
  draft: {
    icon: ClipboardList,
    color: 'text-slate-700',
    label: 'Draft',
    bg: 'bg-white border-slate-200',
  },
  verified: {
    icon: CheckCircle2,
    color: 'text-emerald-700',
    label: 'Terverifikasi',
    bg: 'bg-emerald-50 border-emerald-200',
  },
  rejected: {
    icon: AlertCircle,
    color: 'text-rose-700',
    label: 'Ditolak',
    bg: 'bg-rose-50 border-rose-200',
  },
}

function getMemberLabel(teamMembers: Array<{ name?: string }> | undefined) {
  const count = teamMembers?.length || 0
  return count === 1 ? '1 peserta' : `${count} anggota`
}

export default async function DashboardPage() {
  const registrations = await getRegistrations()
  const submittedCount = registrations.filter((reg) => reg.status === 'submitted').length
  const verifiedCount = registrations.filter((reg) => reg.status === 'verified').length

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 sm:px-10 lg:px-12">
      <section className="mx-auto w-full max-w-6xl space-y-12">
        <NeuralDashboard
          registrationCount={registrations.length}
          pendingCount={submittedCount}
          verifiedCount={verifiedCount}
        />

        {/* Quick Steps */}
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              step: '1',
              title: 'Pilih Kompetisi',
              description: 'Jelajahi kompetisi yang tersedia dan pilih yang diminati.',
              icon: ClipboardList,
            },
            {
              step: '2',
              title: 'Isi Form Registrasi',
              description: 'Tambahkan anggota tim dan lengkapi data pendaftaran.',
              icon: CheckCircle2,
            },
            {
              step: '3',
              title: 'Cek Status',
              description: 'Pantau status pendaftaran secara real-time di dashboard.',
              icon: Clock,
            },
          ].map(({ step, title, description, icon: Icon }) => (
            <div key={step} className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-start gap-4">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                  <Icon className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Step {step}</p>
                  <h3 className="mt-1 font-semibold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg" className="rounded-full bg-indigo-600 px-6 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all">
            <Link href="/competitions">
              Lihat Kompetisi
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full px-6 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
            <Link href="/dashboard/my-tickets">Tiket Saya</Link>
          </Button>
        </div>

        {/* Registrations List */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Registrasi Terbaru</h2>
            <p className="mt-2 text-slate-600">
              {registrations.length === 0
                ? 'Belum ada registrasi. Mulai daftar kompetisi sekarang.'
                : `${registrations.length} registrasi aktif`}
            </p>
          </div>

          {registrations.length > 0 ? (
            <div className="space-y-4">
              {registrations.map((reg) => {
                const statusInfo = statusConfig[reg.status] || statusConfig.submitted
                const StatusIcon = statusInfo.icon
                const isDraftTeam = reg.registration_kind === 'team' && reg.status === 'draft'
                const canPay =
                  reg.status === 'submitted' &&
                  reg.payment_status !== 'paid' &&
                  (reg.registration_kind === 'individual' || Boolean(reg.is_team_leader))
                const submitDisabledReason =
                  isDraftTeam && (reg.team_member_count || 0) < (reg.team_min || 1)
                    ? `Minimal ${reg.team_min || 1} anggota sebelum submit.`
                    : undefined

                return (
                  <div
                    key={reg.id}
                    className={`rounded-2xl border ${statusInfo.bg} p-6 transition-all duration-300 hover:shadow-md`}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      {/* Team Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-slate-900">{reg.team_name}</h3>
                          <div className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${statusInfo.color}`}>
                            <StatusIcon className="h-4 w-4" />
                            {statusInfo.label}
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">
                          Kompetisi: <span className="font-semibold">{reg.competition_name || reg.competition_id}</span>
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          Jenis: <span className="font-semibold">{reg.registration_kind === 'individual' ? 'Individu' : 'Tim'}</span>
                        </p>
                        {reg.status === 'submitted' && reg.payment_status ? (
                          <p className="mt-1 text-sm text-slate-600">
                            Pembayaran:{' '}
                            <span className="font-semibold capitalize">
                              {reg.payment_status === 'unpaid' ? 'Belum dibuat' : reg.payment_status}
                            </span>
                          </p>
                        ) : null}
                        {reg.team_uid && (
                          <p className="mt-1 text-sm text-slate-600">
                            UID Tim: <span className="font-mono font-semibold">{reg.team_uid}</span>
                          </p>
                        )}
                        <p className="mt-1 text-sm text-slate-600">
                          {getMemberLabel(reg.team_members)}
                          {reg.registration_kind === 'team' && reg.team_min && reg.team_max
                            ? ` dari ${reg.team_min}-${reg.team_max} anggota wajib`
                            : ''}
                        </p>
                      </div>

                      {/* Action */}
                      {isDraftTeam && reg.is_team_leader && reg.team_id ? (
                        <TeamSubmitButton teamId={reg.team_id} disabledReason={submitDisabledReason} />
                      ) : canPay ? (
                        <PaymentActionButton
                          registrationId={reg.id}
                          paymentProvider={reg.payment?.provider}
                          paymentStatus={reg.payment_status}
                        />
                      ) : (
                        <Button asChild variant="ghost" size="sm" className="rounded-full">
                          <Link href="/dashboard">Lihat Detail</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-slate-200">
                <ClipboardList className="h-6 w-6 text-slate-500" />
              </div>
              <p className="mt-4 font-semibold text-slate-900">Belum ada registrasi</p>
              <p className="mt-2 text-slate-600">Mulai daftar kompetisi sekarang untuk melihat status di sini.</p>
              <Button asChild size="sm" className="mt-6 rounded-full bg-indigo-600 hover:bg-indigo-700">
                <Link href="/competitions">Lihat Kompetisi</Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
