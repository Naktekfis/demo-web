import { sanityClient } from '@/lib/sanity/client'
import { competitionBySlugQuery, competitionsQuery } from '@/lib/sanity/queries'
import { hasSanityConfig } from '@/lib/sanity'

export type CompetitionSummary = {
  _id: string
  title: string
  slug: { current: string }
  description?: unknown
  category?: string
  registrationType: 'individual' | 'team'
  teamUidPrefix?: string
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
    registrationType: 'team',
    teamUidPrefix: 'RBT',
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
    registrationType: 'team',
    teamUidPrefix: 'HCK',
    teamMin: 3,
    teamMax: 5,
    regOpen: new Date().toISOString(),
    regClose: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString(),
    requirements: ['Laptop pribadi', 'GitHub account', 'Pitch deck awal'],
  },
  {
    _id: 'paper-demo',
    title: 'Paper Competition',
    slug: { current: 'paper-competition' },
    description: [{ _type: 'block', children: [{ _type: 'span', text: 'Kompetisi penulisan karya ilmiah individual untuk ide teknologi dan inovasi digital.' }]}],
    category: 'paper',
    registrationType: 'individual',
    teamMin: 1,
    teamMax: 1,
    regOpen: new Date().toISOString(),
    regClose: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21).toISOString(),
    requirements: ['Kartu mahasiswa', 'Abstrak karya', 'Berkas identitas peserta'],
  },
]

function normalizeCompetition(competition: CompetitionSummary): CompetitionSummary {
  const registrationType = competition.registrationType || ((competition.teamMax || 1) > 1 ? 'team' : 'individual')

  return {
    ...competition,
    registrationType,
    teamMin: registrationType === 'individual' ? 1 : competition.teamMin || 1,
    teamMax: registrationType === 'individual' ? 1 : competition.teamMax || 5,
  }
}

export async function getCompetitions() {
  if (!hasSanityConfig()) {
    return fallbackCompetitions.map(normalizeCompetition)
  }

  try {
    const competitions = await sanityClient.fetch<CompetitionSummary[]>(competitionsQuery)
    return (competitions?.length ? competitions : fallbackCompetitions).map(normalizeCompetition)
  } catch {
    return fallbackCompetitions.map(normalizeCompetition)
  }
}

export async function getCompetitionBySlug(slug: string) {
  const fallback = fallbackCompetitions.find((competition) => competition.slug.current === slug) || null

  if (!hasSanityConfig()) {
    return fallback ? normalizeCompetition(fallback) : null
  }

  try {
    const competition = await sanityClient.fetch<CompetitionSummary | null>(competitionBySlugQuery, { slug })
    const selectedCompetition = competition || fallback
    return selectedCompetition ? normalizeCompetition(selectedCompetition) : null
  } catch {
    return fallback ? normalizeCompetition(fallback) : null
  }
}
