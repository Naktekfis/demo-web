import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { getCompetitionBySlug } from '@/lib/competitions'

type CompetitionPageProps = {
  params: Promise<{ slug: string }>
}

export default async function CompetitionDetailPage({ params }: CompetitionPageProps) {
  const { slug } = await params
  const competition = await getCompetitionBySlug(slug)

  if (!competition) {
    notFound()
  }

  const descriptionText = Array.isArray(competition.description)
    ? competition.description
        .flatMap((block: any) => block?.children || [])
        .map((child: any) => child?.text)
        .filter(Boolean)
        .join(' ')
    : typeof competition.description === 'string'
      ? competition.description
      : 'Detail lomba akan tampil dari Sanity ketika project key tersedia.'

  return (
    <main className="min-h-screen px-6 py-12 sm:px-10 lg:px-12">
      <section className="mx-auto w-full max-w-4xl">
        <Link href="/competitions" className="text-sm font-medium text-slate-500 hover:text-slate-950">
          ← Kembali ke daftar lomba
        </Link>

        <div className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium uppercase tracking-wide text-slate-600">
              {competition.category || 'other'}
            </span>
            <span>Tim {competition.teamMin || 1}-{competition.teamMax || 5}</span>
            <span>
              Tutup:{' '}
              {competition.regClose ? new Date(competition.regClose).toLocaleDateString('id-ID') : 'TBA'}
            </span>
          </div>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            {competition.title}
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">{descriptionText}</p>

          {competition.requirements?.length ? (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-slate-950">Persyaratan</h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-600">
                {competition.requirements.map((requirement) => (
                  <li key={requirement}>{requirement}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild className="rounded-full px-5">
              <Link href={`/dashboard/register-competition?comp=${encodeURIComponent(slug)}`}>Daftar sekarang</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full px-5">
              <Link href="/competitions">Lihat lomba lain</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
