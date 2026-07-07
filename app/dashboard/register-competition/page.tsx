import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { CompetitionRegisterForm } from '@/components/dashboard/competition-register-form'
import { getCompetitionBySlug } from '@/lib/competitions'

type RegisterCompetitionPageProps = {
  searchParams: Promise<{ comp?: string }>
}

export default async function RegisterCompetitionPage({ searchParams }: RegisterCompetitionPageProps) {
  const { comp } = await searchParams

  if (!comp) {
    return (
      <main className="min-h-screen px-6 py-12 sm:px-10 lg:px-12">
        <section className="mx-auto w-full max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Pilih kompetisi dulu</h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Halaman registrasi ini membutuhkan slug kompetisi. Buka daftar kompetisi lalu pilih lomba yang ingin didaftarkan.
          </p>
          <div className="mt-6">
            <Button asChild className="rounded-full px-5">
              <Link href="/competitions">Ke daftar kompetisi</Link>
            </Button>
          </div>
        </section>
      </main>
    )
  }

  const competition = await getCompetitionBySlug(comp)

  if (!competition) {
    return (
      <main className="min-h-screen px-6 py-12 sm:px-10 lg:px-12">
        <section className="mx-auto w-full max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Kompetisi tidak ditemukan</h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Slug <span className="font-medium text-slate-950">{comp}</span> belum tersedia di Sanity fallback atau project live.
          </p>
          <div className="mt-6">
            <Button asChild variant="outline" className="rounded-full px-5">
              <Link href="/competitions">Kembali</Link>
            </Button>
          </div>
        </section>
      </main>
    )
  }

  const isIndividual = competition.registrationType === 'individual'

  return (
    <main className="min-h-screen px-6 py-12 sm:px-10 lg:px-12">
      <section className="mx-auto w-full max-w-5xl space-y-8">
        <div className="space-y-3">
          <Link href={`/competitions/${comp}`} className="text-sm font-medium text-slate-500 hover:text-slate-950">
            ← Kembali ke detail lomba
          </Link>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Daftar: {competition.title}
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            {isIndividual
              ? 'Pastikan profil dan nomor telepon sudah lengkap. Registrasi akan masuk dengan status pending untuk ditinjau admin.'
              : 'Registrasi tim akan memakai alur buat tim, UID tim, dan gabung anggota pada fase berikutnya.'}
          </p>
        </div>

        <CompetitionRegisterForm competition={competition} />
      </section>
    </main>
  )
}
