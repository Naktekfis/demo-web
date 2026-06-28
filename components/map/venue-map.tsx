'use client'

import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

interface Venue {
  name: string
  coordinates: [number, number]
  type: 'Lomba' | 'Pameran'
  description: string
}

const venues: Venue[] = [
  { name: 'Aula Timur ITB', coordinates: [107.6108, -6.8926], type: 'Lomba', description: 'Grand Final Kompetisi & Closing Ceremony' },
  { name: 'Labtek VIII', coordinates: [107.6088, -6.8919], type: 'Lomba', description: 'Hackathon Innovation Sprint' },
  { name: 'Sasana Budaya Ganesha', coordinates: [107.6096, -6.8960], type: 'Pameran', description: 'Tech Exhibition ITB' }
]

// ponytail: inline OSM raster tiles — no API key, no CORS issues. Swap to vector tiles for prettier map.
const MAP_STYLE = {
  version: 8 as const,
  sources: {
    osm: {
      type: 'raster' as const,
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [{ id: 'osm', type: 'raster' as const, source: 'osm' }],
}

export function VenueMap() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const [filter, setFilter] = useState<'Semua' | 'Lomba' | 'Pameran'>('Semua')
  const markersRef = useRef<maplibregl.Marker[]>([])

  useEffect(() => {
    if (map.current || !mapContainer.current) return

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLE,
      center: [107.6097, -6.8935],
      zoom: 15
    })

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [])

  useEffect(() => {
    if (!map.current) return

    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    const filteredVenues = filter === 'Semua' ? venues : venues.filter(v => v.type === filter)

    filteredVenues.forEach(venue => {
      const el = document.createElement('div')
      el.className = 'w-6 h-6 rounded-full border-2 border-white shadow-lg ' +
        (venue.type === 'Lomba' ? 'bg-indigo-600' : 'bg-emerald-500')

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(
        `<div class="p-2">
          <h3 class="font-bold text-sm text-slate-900">${venue.name}</h3>
          <p class="text-xs text-slate-600 mt-1">${venue.description}</p>
          <span class="inline-block px-2 py-1 bg-slate-100 rounded text-[10px] uppercase mt-2 font-semibold text-slate-700">${venue.type}</span>
        </div>`
      )

      const marker = new maplibregl.Marker(el)
        .setLngLat(venue.coordinates)
        .setPopup(popup)
        .addTo(map.current!)

      markersRef.current.push(marker)
    })
  }, [filter])

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
