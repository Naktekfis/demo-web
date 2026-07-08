import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, CreditCard } from 'lucide-react'

import { MockPaymentActions } from '@/components/dashboard/mock-payment-actions'
import { Button } from '@/components/ui/button'
import { getAuthenticatedUser } from '@/lib/auth'
import { getAuthorizedPaymentRegistration, getPaymentById } from '@/lib/payments'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

type MockPaymentPageProps = {
  params: {
    id: string
  }
}

const currencyFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

export default async function MockPaymentPage({ params }: MockPaymentPageProps) {
  const auth = await getAuthenticatedUser()

  if (!auth.ok) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <section className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Masuk diperlukan</h1>
          <p className="mt-3 text-slate-600">Silakan masuk untuk membuka pembayaran.</p>
          <Button asChild className="mt-6 rounded-full bg-indigo-600 hover:bg-indigo-700">
            <Link href={`/auth/login?next=${encodeURIComponent(`/dashboard/payments/${params.id}/mock`)}`}>Masuk</Link>
          </Button>
        </section>
      </main>
    )
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <section className="mx-auto max-w-2xl rounded-3xl border border-rose-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Pembayaran belum siap</h1>
          <p className="mt-3 text-slate-600">Konfigurasi server pembayaran belum lengkap.</p>
        </section>
      </main>
    )
  }

  const supabase = createServiceClient()
  const paymentResult = await getPaymentById(supabase, params.id)

  if (!paymentResult.ok) notFound()

  const authorized = await getAuthorizedPaymentRegistration(supabase, paymentResult.payment.registration_id, auth.user.id)

  if (!authorized.ok) notFound()

  const payment = paymentResult.payment
  const registration = authorized.registration
  const isPending = payment.status === 'pending'

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 sm:px-10">
      <section className="mx-auto max-w-3xl space-y-6">
        <Button asChild variant="ghost" className="rounded-full text-slate-700">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Dashboard
          </Link>
        </Button>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-br from-emerald-600 to-cyan-700 p-8 text-white">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
              <CreditCard className="h-6 w-6" />
            </div>
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-100">Mock Payment</p>
            <h1 className="mt-2 text-3xl font-bold">Simulasi Pembayaran</h1>
            <p className="mt-3 max-w-2xl text-emerald-50">
              Halaman ini hanya untuk membuktikan alur UX dan transisi status sebelum integrasi Midtrans Sandbox.
            </p>
          </div>

          <div className="space-y-6 p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Kompetisi</p>
                <p className="mt-2 font-semibold text-slate-900">{registration.competitionName || registration.competitionSlug}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Registrasi</p>
                <p className="mt-2 font-semibold text-slate-900">
                  {registration.registrationKind === 'team' ? registration.teamName || registration.teamUid : 'Individu'}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Nominal</p>
                <p className="mt-2 font-semibold text-slate-900">{currencyFormatter.format(payment.amount)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Status</p>
                <p className="mt-2 font-semibold capitalize text-slate-900">{payment.status}</p>
              </div>
            </div>

            {isPending ? (
              <MockPaymentActions paymentId={payment.id} />
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="font-semibold text-slate-900">Pembayaran mock sudah selesai.</p>
                <p className="mt-2 text-sm text-slate-600">
                  Jika status gagal atau expired, gunakan tombol retry dari dashboard untuk membuat pembayaran baru.
                </p>
              </div>
            )}

            <p className="text-sm text-slate-600">
              Status sukses hanya mengubah pembayaran menjadi <span className="font-semibold">paid</span>. Status registrasi tetap
              <span className="font-semibold"> submitted</span> sampai admin memverifikasi manual.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
