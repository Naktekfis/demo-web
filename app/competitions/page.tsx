import Link from 'next/link'
import { Calendar, Users, Trophy, ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { getCompetitions } from '@/lib/competitions'

export default async function CompetitionsPage() {
  const competitions = await getCompetitions()

  return (
    <main className="min-h-screen bg-white px-6 py-16 sm:px-10 lg:px-12">
      <section className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <div className="mb-16 space-y-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">Kompetisi</p>
          <h1 className="text-5xl font-bold text-slate-900 sm:text-6xl">Kompetisi & Lomba</h1>
          <p className="max-w-2xl text-lg text-slate-600">
            Ikuti berbagai kompetisi seru dan tunjukkan kemampuan Anda. Pilih kategori yang diminati dan daftar sekarang.
          </p>
        </div>

        {/* Competitions Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {competitions.map((competition) => (
            <article
              key={competition._id}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:border-indigo-300 hover:shadow-lg"
            >
              {/* Card Header with Badge */}
              <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-blue-50 p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="mb-3 inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
                      {competition.category || 'Kategori'}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">{competition.title}</h2>
                  </div>
                  <Trophy className="h-6 w-6 text-indigo-500 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </div>

              {/* Card Body */}
              <div className="space-y-4 p-6">
                <p className="line-clamp-3 text-slate-600">
                  {typeof competition.description === 'string'
                    ? competition.description
                    : 'Kompetisi utama ITB Insight yang menantang.'}
                </p>

                {/* Details */}
                <div className="space-y-3 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Users className="h-4 w-4 text-indigo-500" />
                    <span>Tim {competition.teamMin || 1}-{competition.teamMax || 5} orang</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Calendar className="h-4 w-4 text-indigo-500" />
                    <span>
                      Tutup: {competition.regClose
                        ? new Date(competition.regClose).toLocaleDateString('id-ID', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: 'numeric' 
                          })
                        : 'TBA'}
                    </span>
                  </div>
                </div>

                {/* CTA Button */}
                <Button asChild className="w-full rounded-full bg-indigo-600 hover:bg-indigo-700">
                  <Link href={`/competitions/${competition.slug.current}`}>
                    Lihat Detail
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
