import { VenueMap } from '@/components/map/venue-map'
import { MapPinned } from 'lucide-react'

export const metadata = {
  title: 'Peta Venue - ITB Insight',
}

export default function MapPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 sm:px-10 lg:px-12">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
            <MapPinned className="h-6 w-6 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl">Peta Venue Event</h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Temukan lokasi kompetisi dan pameran teknologi di area kampus ITB Bandung.
          </p>
        </div>

        <VenueMap />
      </div>
    </main>
  )
}
