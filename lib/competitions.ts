import { sanityClient } from '@/lib/sanity/client'
import { competitionBySlugQuery, competitionsQuery } from '@/lib/sanity/queries'
import { hasSanityConfig } from '@/lib/sanity'

export type CompetitionSummary = {
  _id: string
  title: string
  slug: { current: string }
  description?: unknown
  category?: string
  teamMin?: number
  teamMax?: number
  regOpen?: string
  regClose?: string
  requirements?: string[]
  guideBookUrl?: string
}

const fallbackCompetitions: CompetitionSummary[] = [
  {
    _id: 'robotics-demo',
    title: 'Robotika Challenge',
    slug: { current: 'robotika-challenge' },
    description: [{ _type: 'block', children: [{ _type: 'span', text: 'Kompetisi robotika untuk tim mahasiswa yang ingin membangun prototipe cerdas dan kompetitif.' }]}],
    category: 'robotika',
    teamMin: 2,
    teamMax: 4,
    regOpen: new Date().toISOString(),
    regClose: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
    requirements: ['Kartu mahasiswa', 'Proposal tim', 'Berkas identitas anggota'],
  },
  {
    _id: 'hackathon-demo',
    title: 'Hackathon Innovation Sprint',
    slug: { current: 'hackathon-innovation-sprint' },
    description: [{ _type: 'block', children: [{ _type: 'span', text: 'Sprint pengembangan produk digital dengan fokus pada solusi nyata untuk kampus dan industri.' }]}],
    category: 'hackathon',
    teamMin: 3,
    teamMax: 5,
    regOpen: new Date().toISOString(),
    regClose: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString(),
    requirements: ['Laptop pribadi', 'GitHub account', 'Pitch deck awal'],
  },
]

export async function getCompetitions() {
  if (!hasSanityConfig()) {
    return fallbackCompetitions
  }

  try {
    const competitions = await sanityClient.fetch<CompetitionSummary[]>(competitionsQuery)
    return competitions?.length ? competitions : fallbackCompetitions
  } catch {
    return fallbackCompetitions
  }
}

export async function getCompetitionBySlug(slug: string) {
  const fallback = fallbackCompetitions.find((competition) => competition.slug.current === slug) || null

  if (!hasSanityConfig()) {
    return fallback
  }

  try {
    const competition = await sanityClient.fetch<CompetitionSummary | null>(competitionBySlugQuery, { slug })
    return competition || fallback
  } catch {
    return fallback
  }
}
