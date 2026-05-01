'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

interface Venue {
  name: string
  coordinates: [number, number]
  type: 'Lomba' | 'Pameran'
  description: string
}

const venues: Venue[] = [
  { name: 'Aula Timur', coordinates: [107.6097, -6.8904], type: 'Lomba', description: 'Kompetisi Robotika' },
  { name: 'Labtek VIII', coordinates: [107.6088, -6.8919], type: 'Lomba', description: 'Hackathon Innovation Sprint' },
  { name: 'Sasana Budaya Ganesha', coordinates: [107.6096, -6.8960], type: 'Pameran', description: 'Tech Exhibition ITB' }
]

export function VenueMap() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [filter, setFilter] = useState<'Semua' | 'Lomba' | 'Pameran'>('Semua')
  const markersRef = useRef<mapboxgl.Marker[]>([])

  useEffect(() => {
    if (map.current) return // initialize map only once
    
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [107.6106, -6.8917], // ITB Bandung
      zoom: 15
    })

    // Cleanup on unmount
    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [])

  // Update markers when filter changes
  useEffect(() => {
    if (!map.current) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // Filter venues
    const filteredVenues = filter === 'Semua' ? venues : venues.filter(v => v.type === filter)

    // Add new markers
    filteredVenues.forEach(venue => {
      const el = document.createElement('div')
      el.className = 'w-6 h-6 rounded-full border-2 border-white shadow-lg ' + 
        (venue.type === 'Lomba' ? 'bg-indigo-600' : 'bg-emerald-500')

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<div class="p-2">
          <h3 class="font-bold text-sm text-slate-900">${venue.name}</h3>
          <p class="text-xs text-slate-600 mt-1">${venue.description}</p>
          <span class="inline-block px-2 py-1 bg-slate-100 rounded text-[10px] uppercase mt-2 font-semibold text-slate-700">${venue.type}</span>
        </div>`
      )

      const marker = new mapboxgl.Marker(el)
        .setLngLat(venue.coordinates)
        .setPopup(popup)
        .addTo(map.current!)

      markersRef.current.push(marker)
    })
  }, [filter])

  if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-slate-100 rounded-2xl border border-slate-200">
        <div className="text-center p-6">
          <h3 className="text-lg font-semibold text-slate-900">Mapbox Token Missing</h3>
          <p className="text-slate-500 mt-2">Please add NEXT_PUBLIC_MAPBOX_TOKEN to your .env.local file.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(['Semua', 'Lomba', 'Pameran'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === f 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      
      <div className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-lg border border-slate-200">
        <div ref={mapContainer} className="absolute inset-0" />
      </div>
    </div>
  )
}
