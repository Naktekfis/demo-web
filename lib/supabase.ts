import { createClient, SupabaseClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
if (!anonKey) console.warn('WARNING: NEXT_PUBLIC_SUPABASE_ANON_KEY not set — client may be limited')

export const supabase = createClient(url, anonKey || '')

export function createServiceClient(): SupabaseClient {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY for service client')
  return createClient(url, serviceKey)
}

export default supabase
