import Link from "next/link"
import { ArrowRight, CheckCircle2, MapPinned, ShieldCheck, Sparkles, Ticket, Users } from "lucide-react"

import { Button } from "@/components/ui/button"

const highlights = [
  {
    icon: Sparkles,
    title: "Pendaftaran mudah",
    description: "Alur registrasi yang simpel dan intuitif untuk peserta.",
  },
  {
    icon: Users,
    title: "Manajemen tim",
    description: "Kelola anggota tim dengan form yang user-friendly.",
  },
  {
    icon: CheckCircle2,
    title: "Status real-time",
    description: "Pantau status pendaftaran secara real-time di dashboard.",
  },
]

export default function Home() {
  return (
    <main className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-80px)] bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 px-6 py-20 sm:px-10 lg:px-12">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-1/3 -top-1/2 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute -bottom-1/2 -left-1/4 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative mx-auto flex min-h-[calc(100vh-80px-120px)] w-full max-w-6xl flex-col justify-center gap-8">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-indigo-400/50 bg-indigo-500/10 px-4 py-2 text-sm text-indigo-200">
            <Ticket className="h-4 w-4" />
            <span>Platform Registrasi ITB Insight</span>
          </div>

          <div className="space-y-6">
            <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Daftar kompetisi dengan mudah
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              Bergabunglah dengan kompetisi terbaik di ITB Insight. Daftar, kelola tim, dan menangkan hadiah menarik bersama kami.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="rounded-full bg-indigo-600 px-8 hover:bg-indigo-700">
              <Link href="/competitions">
                Lihat Kompetisi
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full border-slate-400 bg-slate-800/50 px-8 text-white hover:bg-slate-700 hover:text-white">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section id="highlights" className="bg-white px-6 py-20 sm:px-10 lg:px-12">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-16 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">Fitur Utama</p>
            <h2 className="mt-3 text-4xl font-bold text-slate-900 sm:text-5xl">Pengalaman terbaik untuk peserta</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {highlights.map((item, idx) => {
              const Icon = item.icon
              return (
                <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50 p-8 transition-all duration-300 hover:border-indigo-300 hover:bg-indigo-50">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
                    <Icon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-slate-600">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-600 px-6 py-16 sm:px-10 lg:px-12">
        <div className="mx-auto w-full max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Siap untuk mengikuti kompetisi?</h2>
          <p className="mt-4 text-lg text-indigo-100">Jangan lewatkan kesempatan emas untuk berkompetisi dan menunjukkan kemampuan Anda.</p>
          <div className="mt-8">
            <Button asChild size="lg" className="rounded-full bg-white px-8 text-indigo-600 hover:bg-slate-100">
              <Link href="/competitions">
                Mulai Daftar Sekarang
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
