'use client'
import { QRCodeCanvas } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export function QRTicket({ userId, userName }: { userId: string; userName: string }) {
  const qrValue = JSON.stringify({
    userId,
    userName,
    timestamp: new Date().toISOString(),
  })

  const handleDownload = () => {
    const canvas = document.querySelector('canvas')
    if (canvas) {
      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/png')
      link.download = `ticket-${userId.slice(0, 8)}.png`
      link.click()
    }
  }

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-3xl text-white shadow-xl max-w-sm w-full mx-auto relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/10 blur-xl" />
      <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-indigo-900/20 blur-xl" />
      
      <div className="relative z-10 text-center">
        <div className="inline-flex items-center justify-center bg-white/20 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase mb-4 backdrop-blur-sm border border-white/20">
          VIP Access
        </div>
        
        <h3 className="text-3xl font-bold mb-8">Tiket Masuk</h3>
        
        <div className="bg-white p-6 rounded-2xl flex justify-center mb-8 shadow-inner shadow-slate-200">
          <QRCodeCanvas
            value={qrValue}
            size={220}
            level="H"
            includeMargin={true}
            className="rounded-lg"
          />
        </div>

        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-md border border-white/20 text-left mb-8">
          <p className="text-sm text-indigo-100 mb-1">Nama Peserta</p>
          <p className="text-lg font-semibold mb-3">{userName}</p>
          
          <p className="text-sm text-indigo-100 mb-1">User ID</p>
          <p className="text-sm font-mono bg-white/10 px-2 py-1 rounded inline-block">{userId.slice(0, 8).toUpperCase()}</p>
        </div>

        <Button 
          onClick={handleDownload} 
          className="w-full bg-white text-indigo-600 hover:bg-slate-100 rounded-full font-bold h-12 shadow-lg"
        >
          <Download className="mr-2 h-5 w-5" />
          Download QR Code
        </Button>
      </div>
    </div>
  )
}
