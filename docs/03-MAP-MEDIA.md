# Phase 3: Map + Media 🗺️

**Timeline:** Hari 6-7  
**Goal:** Fitur diferensiator visual yang bikin "wow"  
**Target Deliverable:** Map interaktif berjalan, halaman terasa smooth dan "mahal"

---

## Checklist

- [ ] Install Mapbox GL JS
- [ ] Create Mapbox component dengan venue ITB
- [ ] Add pins untuk 3 venue utama
- [ ] Create filter buttons (Lomba / Pameran / Semua)
- [ ] Create media gallery page
- [ ] Implement lazy loading untuk images
- [ ] Add Framer Motion transitions
- [ ] Add scroll-triggered animations

---

## Step 1: Setup Mapbox Component

**components/map/VenueMap.tsx:**
```typescript
'use client'
import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

interface Venue {
  id: string
  name: string
  category: 'lomba' | 'pameran' | 'lainnya'
  coords: [number, number]
  description: string
}

const venues: Venue[] = [
  {
    id: '1',
    name: 'Aula Timur',
    category: 'lomba',
    coords: [-6.8904, 107.6097],
    description: 'Venue untuk pembukaan dan lomba utama',
  },
  {
    id: '2',
    name: 'Labtek VIII',
    category: 'lomba',
    coords: [-6.8919, 107.6088],
    description: 'Workshop dan session teknis',
  },
  {
    id: '3',
    name: 'Sasana Budaya Ganesha',
    category: 'pameran',
    coords: [-6.8960, 107.6096],
    description: 'Pameran industri dan booth',
  },
]

export function VenueMap() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [filter, setFilter] = React.useState<'semua' | 'lomba' | 'pameran'>('semua')

  useEffect(() => {
    if (!mapContainer.current) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-6.8917, 107.6106],
      zoom: 15,
    })

    // Add markers
    venues
      .filter(v => filter === 'semua' || v.category === filter)
      .forEach(venue => {
        const el = document.createElement('div')
        el.className = 'w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold cursor-pointer hover:bg-blue-800'
        el.textContent = '📍'

        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div class="p-2">
            <h3 class="font-bold">${venue.name}</h3>
            <p class="text-sm text-gray-600">${venue.description}</p>
          </div>
        `)

        new mapboxgl.Marker(el)
          .setLngLat(venue.coords)
          .setPopup(popup)
          .addTo(map.current!)
      })

    return () => {
      map.current?.remove()
    }
  }, [filter])

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {(['semua', 'lomba', 'pameran'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded capitalize ${
              filter === f 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      <div ref={mapContainer} className="w-full h-96 rounded-lg" />
    </div>
  )
}
```

---

## Step 2: Create Map Page

**app/(public)/map/page.tsx:**
```typescript
'use client'
import { VenueMap } from '@/components/map/VenueMap'
import { motion } from 'framer-motion'

export default function MapPage() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto py-12"
    >
      <h1 className="text-4xl font-bold mb-4">Lokasi Venue ITB Insight</h1>
      <p className="text-gray-600 mb-8">
        Kampus ITB Bandung - Area Jalan Ganesha
      </p>
      
      <VenueMap />
      
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          className="bg-blue-50 p-6 rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="font-bold text-lg mb-2">📍 Aula Timur</h3>
          <p className="text-sm text-gray-600">
            Venue untuk pembukaan dan lomba utama event
          </p>
        </motion.div>

        <motion.div 
          className="bg-blue-50 p-6 rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h3 className="font-bold text-lg mb-2">🔬 Labtek VIII</h3>
          <p className="text-sm text-gray-600">
            Workshop dan session teknis untuk peserta
          </p>
        </motion.div>

        <motion.div 
          className="bg-blue-50 p-6 rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="font-bold text-lg mb-2">🎪 Sasana Budaya</h3>
          <p className="text-sm text-gray-600">
            Pameran industri dan booth partner
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}
```

---

## Step 3: Create Media Gallery

**app/(public)/gallery/page.tsx:**
```typescript
'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

// Placeholder images - ganti dengan URL real nanti
const images = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  src: `https://images.unsplash.com/photo-${1600000000 + i}?w=400&h=300&fit=crop`,
  alt: `Gallery image ${i + 1}`,
}))

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto py-12"
    >
      <h1 className="text-4xl font-bold mb-4">Galeri Media</h1>
      <p className="text-gray-600 mb-8">Koleksi foto dan video dari event ITB Insight</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {images.map((img, idx) => (
          <motion.div
            key={img.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            onClick={() => setSelectedImage(img.id)}
            className="cursor-pointer overflow-hidden rounded-lg"
          >
            <Image
              src={img.src}
              alt={img.alt}
              width={400}
              height={300}
              className="w-full h-48 object-cover hover:scale-105 transition"
            />
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImage !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center"
          onClick={() => setSelectedImage(null)}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[selectedImage].src}
              alt="Full size"
              width={800}
              height={600}
              className="w-full h-auto"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white text-2xl"
            >
              ✕
            </button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}
```

---

## Step 4: Add Framer Motion to Landing Components

**components/landing/ProgramHighlights.tsx:**
```typescript
'use client'
import { motion } from 'framer-motion'

const programs = [
  {
    title: 'Kompetisi Robotika',
    description: 'Lomba robotika dengan tema "AI for Sustainability"',
    icon: '🤖',
  },
  {
    title: 'Paper Presentation',
    description: 'Presentasi paper karya ilmiah terbaik',
    icon: '📄',
  },
  {
    title: 'Hackathon',
    description: '24 jam coding challenge dengan hadiah menarik',
    icon: '💻',
  },
  {
    title: 'Pameran Teknologi',
    description: 'Showcase produk dan inovasi dari industri',
    icon: '🏆',
  },
]

export function ProgramHighlights() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-12"
      initial="hidden"
      whileInView="visible"
      variants={containerVariants}
      viewport={{ once: true, margin: '-100px' }}
    >
      {programs.map((program, idx) => (
        <motion.div
          key={idx}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200 hover:shadow-lg transition"
          variants={itemVariants}
          whileHover={{ y: -5 }}
        >
          <div className="text-4xl mb-3">{program.icon}</div>
          <h3 className="font-bold text-lg mb-2">{program.title}</h3>
          <p className="text-sm text-gray-600">{program.description}</p>
        </motion.div>
      ))}
    </motion.div>
  )
}
```

---

## Step 5: Install Dependencies

```bash
npm install mapbox-gl @types/mapbox-gl
```

---

## Testing Checklist

- [ ] `/map` page loads dan menampilkan peta
- [ ] Marker pins muncul di lokasi yang tepat
- [ ] Click marker → popup dengan info venue
- [ ] Filter buttons berfungsi (show/hide pins)
- [ ] `/gallery` page menampilkan grid gambar
- [ ] Click gambar → lightbox muncul
- [ ] Framer Motion animations smooth
- [ ] Responsive di mobile

---

## Next Phase
Ketika Phase 3 selesai → Lanjut ke **Phase 4: Content + Polish** (04-CONTENT-POLISH.md)
