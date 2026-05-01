import Link from "next/link"
import { ArrowRight, CheckCircle2, MapPinned, ShieldCheck, Sparkles, Ticket } from "lucide-react"

import { Button } from "@/components/ui/button"

const highlights = [
  {
    icon: Sparkles,
    title: "Beralih dari scaffold ke produk",
    description: "Fondasi Next.js, shadcn/ui, Supabase, dan dokumentasi fase sudah siap dipakai.",
  },
  {
    icon: MapPinned,
    title: "Alur event yang jelas",
    description: "Homepage ini menjadi titik masuk untuk registrasi, venue, dan konten acara.",
  },
  {
    icon: ShieldCheck,
    title: "Siap bertumbuh per fase",
    description: "Struktur proyek sekarang cukup rapi untuk lanjut ke Sanity, media, dan deployment.",
  },
]

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.08),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-6 py-10 text-slate-950 sm:px-10 lg:px-12">
      <div className="absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.18),_transparent_55%)] blur-3xl" />

      <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl flex-col justify-center gap-12">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 text-sm shadow-sm backdrop-blur">
          <Ticket className="h-4 w-4 text-slate-700" />
          <span>ITB Insight demo workspace</span>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-7">
            <div className="space-y-4">
              <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                Homepage event yang rapi, cepat, dan siap diisi konten fase berikutnya.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                Ini sudah memakai komponen shadcn/ui, koneksi Supabase yang tervalidasi, dan struktur
                Next.js yang bisa langsung dipakai untuk registrasi, media, dan deployment.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-full px-6">
                <Link href="#highlights">
                  Lihat highlight
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-6">
                <Link href="/docs">Buka dokumentasi</Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-slate-600">
              {['Next.js 14', 'shadcn/ui', 'Supabase', 'Tailwind'].map((item) => (
                <span key={item} className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 shadow-sm">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur">
            <div className="space-y-4 rounded-2xl bg-slate-950 p-5 text-white shadow-inner">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Phase 0 status</p>
              <p className="text-2xl font-semibold">Fondasi awal sudah hidup.</p>
              <div className="space-y-3 text-sm text-slate-300">
                {[
                  'Next.js app scaffold selesai',
                  'Supabase connectivity sudah dicek',
                  'shadcn/ui aktif dan siap dipakai',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div id="highlights" className="grid gap-4 md:grid-cols-3">
          {highlights.map((item) => {
            const Icon = item.icon

            return (
              <article
                key={item.title}
                className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur transition-transform duration-200 hover:-translate-y-1"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold text-slate-950">{item.title}</h2>
                <p className="mt-3 leading-7 text-slate-600">{item.description}</p>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}
