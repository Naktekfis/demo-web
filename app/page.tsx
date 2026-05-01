import Link from "next/link"
import { ArrowRight, CheckCircle2, MapPinned, ShieldCheck, Sparkles, Ticket, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { HeroParticles } from "@/components/landing/hero-particles"
import { CountdownTimer } from "@/components/landing/countdown-timer"
import { ProgramHighlights } from "@/components/landing/program-highlights"

const stats = [
  { value: "10+", label: "Kompetisi" },
  { value: "2000+", label: "Peserta" },
  { value: "100M+", label: "Total Hadiah" },
]



export default function Home() {
  return (
    <main className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-80px)] bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 px-6 py-20 sm:px-10 lg:px-12">
        <HeroParticles />
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

          <div className="mt-2">
            <CountdownTimer />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row mt-4">
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

          <div className="flex gap-8 mt-8 border-t border-white/10 pt-8">
            {stats.map((stat, idx) => (
              <div key={idx}>
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-indigo-200 mt-1">{stat.label}</div>
              </div>
            ))}
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

          <ProgramHighlights />
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
