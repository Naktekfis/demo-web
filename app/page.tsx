import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ProgramHighlights } from "@/components/landing/program-highlights"
import { HeroNeuralStage } from "@/components/landing/hero-neural-stage"

export default function Home() {
  return (
    <main className="overflow-hidden">
      <HeroNeuralStage />

      {/* Highlights Section */}
      <section id="highlights" className="bg-[#f8fbff] px-6 py-20 sm:px-10 lg:px-12">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-16 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#E43636]">Alur Peserta</p>
            <h2 className="font-heading mt-3 text-4xl font-bold text-slate-950 sm:text-5xl">Semua kebutuhan lomba, dari daftar sampai hari-H</h2>
          </div>

          <ProgramHighlights />
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#070814] px-6 py-16 text-white sm:px-10 lg:px-12">
        <div className="mx-auto w-full max-w-4xl text-center">
          <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl">Siapkan timmu untuk ITB Insight 2026.</h2>
          <p className="mt-4 text-lg text-[#dbe6ff]">Pilih cabang lomba, lengkapi data, lalu cek status pendaftaran langsung dari dashboard.</p>
          <div className="mt-8">
            <Button asChild size="lg" className="rounded-full bg-[#FFE343] px-8 text-slate-950 hover:bg-[#FAD500]">
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
