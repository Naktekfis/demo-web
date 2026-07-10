import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10 lg:px-12">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          {/* Logo & Copyright */}
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <Link href="/" className="flex items-center gap-2">
              <img src="/brand/logo-black-text.svg" alt="ITB Insight" className="h-8 w-auto" />
            </Link>
            <p className="text-xs text-slate-400">
              &copy; {new Date().getFullYear()} ITB Insight. Seluruh hak cipta dilindungi.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500">
            <Link href="/about" className="hover:text-indigo-600 transition-colors">
              Tentang
            </Link>
            <Link href="/terms" className="hover:text-indigo-600 transition-colors">
              Syarat &amp; Ketentuan
            </Link>
            <Link href="/competitions" className="hover:text-indigo-600 transition-colors">
              Kompetisi
            </Link>
          </div>

          {/* Contact placeholder */}
          <div className="text-center text-xs text-slate-400 sm:text-right">
            <p>Institut Teknologi Bandung</p>
            <p className="mt-0.5">Kontak: <span className="text-slate-300">(akan diisi)</span></p>
          </div>
        </div>
      </div>
    </footer>
  )
}
