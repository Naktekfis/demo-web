import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function DashboardPage() {
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
      </section>
    </main>
  )
}
