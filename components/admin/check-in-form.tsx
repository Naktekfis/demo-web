'use client'

import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { getNearestCheckinVenue } from '@/lib/geofence'

type BarcodeDetectorInstance = {
  detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue?: string }>>
}

type BarcodeDetectorConstructor = new (options?: { formats?: string[] }) => BarcodeDetectorInstance

export function CheckInForm() {
  const [ticketCode, setTicketCode] = useState('')
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const nearest = location ? getNearestCheckinVenue(location.lat, location.lng) : null

  const getLocation = () => {
    setMessage('')
    if (!navigator.geolocation) {
      setMessage('Browser tidak mendukung GPS.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => setLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
      (error) => setMessage(error.message),
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }

  const stopScanner = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setScanning(false)
  }

  useEffect(() => () => stopScanner(), [])

  const checkIn = async (code: string) => {
    setMessage('')
    if (!location) {
      setMessage('Ambil lokasi staff dulu.')
      return
    }

    const cleanCode = code.trim()
    if (!cleanCode) {
      setMessage('Kode tiket wajib diisi.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    if (!token) {
      setMessage('Sesi habis. Login ulang.')
      setLoading(false)
      return
    }

    const response = await fetch('/api/admin/check-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ticketCode: cleanCode, lat: location.lat, lng: location.lng }),
    })
    const payload = await response.json()
    setMessage(response.ok ? `Check-in berhasil di ${payload.venue.name}.` : payload.error || 'Check-in gagal.')
    if (response.ok) setTicketCode('')
    setLoading(false)
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await checkIn(ticketCode)
  }

  const startScanner = async () => {
    setMessage('')
    const BarcodeDetector = (window as unknown as { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector
    if (!BarcodeDetector) {
      setMessage('Browser belum mendukung kamera QR scanner. Pakai input manual dulu.')
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
        const [result] = await detector.detect(videoRef.current)
        const code = result?.rawValue?.trim()
        if (code) {
          active = false
          setTicketCode(code)
          stopScanner()
          await checkIn(code)
          return
        }
        requestAnimationFrame(scan)
      }

      requestAnimationFrame(scan)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Gagal membuka kamera.')
      stopScanner()
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 space-y-2">
        <h2 className="text-xl font-bold text-slate-900">QR Check-in</h2>
        <p className="text-sm text-slate-600">Scan QR tiket untuk menandai kehadiran. Input manual tetap tersedia.</p>
      </div>

      <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
        {location ? (
          <>
            <p className="font-semibold">Lokasi staff aktif</p>
            <p className="mt-1 font-mono text-xs">{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>
            {nearest ? <p className="mt-2">Terdekat: {nearest.name} ({nearest.distanceMeters.toFixed(0)}m / {nearest.radiusMeters}m)</p> : null}
          </>
        ) : (
          <p>Lokasi belum diambil.</p>
        )}
        <Button type="button" onClick={getLocation} variant="outline" className="mt-3 rounded-full">
          Ambil Lokasi Staff
        </Button>
      </div>

      <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
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
          <label htmlFor="ticketCode" className="block text-sm font-semibold text-slate-700">Kode Tiket</label>
          <input
            id="ticketCode"
            value={ticketCode}
            onChange={(event) => setTicketCode(event.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 font-mono text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="Paste hasil scan QR di sini"
            required
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full rounded-full bg-indigo-600 hover:bg-indigo-700">
          {loading ? 'Memproses...' : 'Check-in Tiket'}
        </Button>
      </form>

      {message ? <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">{message}</div> : null}
    </div>
  )
}
