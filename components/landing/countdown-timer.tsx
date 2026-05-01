'use client'
import { useState, useEffect } from 'react'

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0, hours: 0, minutes: 0, seconds: 0
  })

  useEffect(() => {
    const targetDate = new Date(process.env.NEXT_PUBLIC_EVENT_DATE || '2026-11-15T08:00:00+07:00').getTime()

    const interval = setInterval(() => {
      const now = new Date().getTime()
      const distance = targetDate - now

      if (distance < 0) {
        clearInterval(interval)
        return
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex gap-4">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div key={unit} className="flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-2xl font-bold text-white shadow-xl">
            {value.toString().padStart(2, '0')}
          </div>
          <span className="mt-2 text-xs uppercase tracking-wider text-indigo-200">{unit}</span>
        </div>
      ))}
    </div>
  )
}
