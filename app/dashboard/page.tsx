import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { getRegistrations } from '@/lib/registrations'

export const dynamic = 'force-dynamic'

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  verified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
}

function getMemberLabel(teamMembers: Array<{ name?: string }> | undefined) {
  const count = teamMembers?.length || 0
  return `${count} anggota`
}

export default async function DashboardPage() {
  const registrations = await getRegistrations()

  return (
    <main className="min-h-screen px-6 py-12 sm:px-10 lg:px-12">
      <section className="mx-auto w-full max-w-6xl space-y-10">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">Dashboard</p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Pusat registrasi peserta</h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            Ini adalah landing dashboard awal untuk flow registrasi lomba. Status final akan terisi otomatis saat auth dan RLS selesai disambungkan.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {[
            ['1', 'Pilih lomba', 'Masuk ke halaman kompetisi lalu pilih lomba yang ingin diikuti.'],
            ['2', 'Isi form registrasi', 'Tambahkan anggota tim dan kirim data pendaftaran.'],
            ['3', 'Cek status', 'Status pendaftaran akan ditampilkan setelah database siap.'],
          ].map(([step, title, description]) => (
            <article key={step} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-400">Step {step}</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
            </article>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild className="rounded-full px-5">
            <Link href="/competitions">Lihat kompetisi</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full px-5">
            <Link href="/competitions/robotika-challenge">Coba flow registrasi</Link>
          </Button>
        </div>

        <div className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">Registrasi terbaru</h2>
              <p className="mt-1 text-sm text-slate-500">
                Data ini akan otomatis menarik dari Supabase saat service role key sudah tersedia.
              </p>
            </div>
            <span className="text-sm text-slate-500">Menampilkan {registrations.length} data</span>
          </div>

          <div className="grid gap-4">
            {registrations.map((registration) => {
              const statusClass = statusStyles[registration.status] || 'bg-slate-50 text-slate-700 border-slate-200'

              return (
                <article key={registration.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">{registration.competition_id}</p>
                      <h3 className="mt-1 text-xl font-semibold text-slate-950">{registration.team_name}</h3>
                      <p className="mt-2 text-sm text-slate-600">{getMemberLabel(registration.team_members)}</p>
                    </div>

                    <span className={`rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide ${statusClass}`}>
                      {registration.status}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {(registration.team_members || []).map((member, index) => (
                      <div key={`${registration.id}-${member.email || index}`} className="rounded-2xl bg-slate-50 p-3 text-sm">
                        <p className="font-medium text-slate-950">{member.name || `Member ${index + 1}`}</p>
                        <p className="text-slate-500">{member.email || 'No email'}</p>
                        <p className="text-slate-500">{member.institution || 'Unknown institution'}</p>
                      </div>
                    ))}
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>
    </main>
  )
}
