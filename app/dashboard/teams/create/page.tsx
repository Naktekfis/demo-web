import Link from 'next/link'

import { TeamCreateForm } from '@/components/dashboard/team-create-form'
import { Button } from '@/components/ui/button'
import { getCompetitionBySlug } from '@/lib/competitions'

type TeamCreatePageProps = {
  searchParams: Promise<{ comp?: string }>
}

export default async function TeamCreatePage({ searchParams }: TeamCreatePageProps) {
  const { comp } = await searchParams
  const competition = comp ? await getCompetitionBySlug(comp) : null

  if (!comp || !competition || competition.registrationType !== 'team') {
    return (
      <main className="min-h-screen px-6 py-12 sm:px-10 lg:px-12">
        <section className="mx-auto w-full max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Kompetisi tim tidak ditemukan</h1>
          <p className="mt-3 text-base leading-7 text-slate-600">Pilih kompetisi bertipe tim dari daftar kompetisi.</p>
          <Button asChild className="mt-6 rounded-full px-5">
            <Link href="/competitions">Ke daftar kompetisi</Link>
          </Button>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 sm:px-10 lg:px-12">
      <section className="mx-auto w-full max-w-3xl space-y-8">
        <div className="space-y-3">
          <Link href={`/dashboard/register-competition?comp=${comp}`} className="text-sm font-medium text-slate-500 hover:text-slate-950">
            Kembali ke pilihan tim
          </Link>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950">Buat Tim: {competition.title}</h1>
          <p className="text-base leading-7 text-slate-600">
            Tim dibuat sebagai draft. Setelah dibuat, bagikan UID ke anggota agar mereka bisa bergabung sebelum registrasi final dikirim.
          </p>
        </div>
        <TeamCreateForm competition={competition} />
      </section>
    </main>
  )
}
