import { createClient, type SanityClient } from '@sanity/client'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01'

export function hasSanityConfig() {
  return Boolean(projectId)
}

export function getSanityClient(): SanityClient {
  if (!projectId) {
    throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID')
  }

  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: true,
  })
}

export async function sanityFetch<T>(query: string, params: Record<string, unknown> = {}): Promise<T> {
  const client = getSanityClient()
  return client.fetch<T>(query, params)
}
