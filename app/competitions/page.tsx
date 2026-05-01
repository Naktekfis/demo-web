import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { getCompetitions } from '@/lib/competitions'

export default async function CompetitionsPage() {
  const competitions = await getCompetitions()

  return (
    <main className="min-h-screen px-6 py-12 sm:px-10 lg:px-12">
      <section className="mx-auto w-full max-w-6xl">
        <div className="mb-10 space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">Phase 2</p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Kompetisi & Lomba</h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            Daftar lomba ini akan otomatis memakai data dari Sanity saat project key sudah tersedia.
            Sementara itu, fallback demo tetap tampil supaya flow halaman bisa divalidasi sekarang.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {competitions.map((competition) => (
            <article
              key={competition._id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-transform duration-200 hover:-translate-y-1"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600">
                  {competition.category || 'other'}
                </span>
                <span className="text-xs text-slate-500">
                  Tim {competition.teamMin || 1}-{competition.teamMax || 5}
                </span>
              </div>

              <h2 className="text-2xl font-semibold text-slate-950">{competition.title}</h2>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                {typeof competition.description === 'string'
                  ? competition.description
                  : 'Lomba utama demo ITB Insight.'}
              </p>

              <div className="mt-5 flex items-center justify-between gap-4">
                <p className="text-sm text-slate-500">
                  Tutup:{' '}
                  {competition.regClose
                    ? new Date(competition.regClose).toLocaleDateString('id-ID')
                    : 'TBA'}
                </p>
                <Button asChild size="sm" className="rounded-full px-4">
                  <Link href={`/competitions/${competition.slug.current}`}>Lihat detail</Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
