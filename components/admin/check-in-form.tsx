'use client'

import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

type BarcodeDetectorInstance = {
  detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue?: string }>>
}

type BarcodeDetectorConstructor = new (options?: { formats?: string[] }) => BarcodeDetectorInstance

export function CheckInForm() {
  const [qrCode, setQrCode] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const stopScanner = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setScanning(false)
  }

  useEffect(() => () => stopScanner(), [])

  const checkIn = async (code: string) => {
    setMessage('')
    setMessageType('')

    const cleanCode = code.trim()
    if (!cleanCode) {
      setMessage('QR code wajib diisi.')
      setMessageType('error')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    if (!token) {
      setMessage('Sesi habis. Login ulang.')
      setMessageType('error')
      setLoading(false)
      return
    }

    const response = await fetch('/api/admin/check-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ qrCode: cleanCode }),
    })
    const payload = await response.json()

    if (response.ok) {
      setMessage('Check-in berhasil.')
      setMessageType('success')
      setQrCode('')
    } else {
      setMessage(payload.error?.message || 'Check-in gagal.')
      setMessageType('error')
    }
    setLoading(false)
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await checkIn(qrCode)
  }

  const startScanner = async () => {
    setMessage('')
    setMessageType('')
    const BarcodeDetector = (window as unknown as { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector
    if (!BarcodeDetector) {
      setMessage('Browser belum mendukung kamera QR scanner. Pakai input manual dulu.')
      setMessageType('error')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      setScanning(true)

      const video = videoRef.current
      if (!video) return

      video.srcObject = stream
      await video.play()

      const detector = new BarcodeDetector({ formats: ['qr_code'] })
      let active = true

      const scan = async () => {
        if (!active || !streamRef.current || !videoRef.current) return
        try {
          const results = await detector.detect(videoRef.current)
          const code = results[0]?.rawValue?.trim()
          if (code) {
            active = false
            setQrCode(code)
            stopScanner()
            await checkIn(code)
            return
          }
        } catch {}
        requestAnimationFrame(scan)
      }

      requestAnimationFrame(scan)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Gagal membuka kamera.')
      setMessageType('error')
      stopScanner()
    }
  }

  return (
    <div className="rounded-[1.75rem] border border-white/70 bg-white/90 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="mb-6 space-y-2">
        <h2 className="font-heading text-2xl font-black text-slate-950">QR Check-in</h2>
        <p className="text-sm text-slate-600">Scan QR tiket untuk menandai kehadiran. Input manual tetap tersedia.</p>
      </div>

      <div className="mb-5 rounded-[1.5rem] border border-slate-200 bg-slate-50/90 p-4">
        <video ref={videoRef} className={scanning ? 'aspect-video w-full rounded-lg bg-black object-cover' : 'hidden'} muted playsInline />
        <div className="mt-3 flex gap-3">
          <Button type="button" onClick={startScanner} disabled={scanning || loading} className="rounded-full bg-indigo-600 hover:bg-indigo-700">
            {scanning ? 'Scanning...' : 'Scan QR Kamera'}
          </Button>
          {scanning ? (
            <Button type="button" onClick={stopScanner} variant="outline" className="rounded-full">
              Stop
            </Button>
          ) : null}
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="qrCode" className="block text-sm font-semibold text-slate-700">QR Code</label>
          <input
            id="qrCode"
            value={qrCode}
            onChange={(event) => setQrCode(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-mono text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            placeholder="Paste hasil scan QR di sini"
            required
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full rounded-full bg-indigo-600 hover:bg-indigo-700">
          {loading ? 'Memproses...' : 'Check-in Tiket'}
        </Button>
      </form>

      {message ? (
        <div className={`mt-5 rounded-xl border p-4 text-sm ${messageType === 'success' ? 'border-green-200 bg-green-50 text-green-800' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
          {message}
        </div>
      ) : null}
    </div>
  )
}
