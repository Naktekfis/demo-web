'use client'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { QRTicket } from '@/components/dashboard/QRTicket'
import { Loader2, Ticket } from 'lucide-react'

export default function MyTicketsPage() {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [])

  return (
    <main className="min-h-[calc(100vh-80px)] bg-slate-50 px-6 py-16 sm:px-10 lg:px-12">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-12">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
            <Ticket className="h-6 w-6 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Tiket Saya</h1>
          <p className="mt-2 text-lg text-slate-600">
            Gunakan QR Code ini sebagai tiket masuk untuk event ITB Insight.
          </p>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          </div>
        ) : user ? (
          <div className="flex justify-center pt-8">
            <QRTicket userId={user.id} userName={user.user_metadata?.full_name || user.email || 'Peserta ITB Insight'} />
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
            <h3 className="text-xl font-semibold text-slate-900">Sesi Habis</h3>
            <p className="text-slate-500 mt-2">Silakan login kembali untuk melihat tiket.</p>
          </div>
        )}
      </div>
    </main>
  )
}
