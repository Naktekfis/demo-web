import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

const optionalUrl = z.string().url().optional()
const optionalString = z.string().min(1).optional()
const optionalBooleanString = z.enum(['true', 'false']).optional()

export const env = createEnv({
  server: {
    ADMIN_EMAILS: optionalString,
    MIDTRANS_IS_PRODUCTION: optionalBooleanString,
    MIDTRANS_SERVER_KEY: optionalString,
    PAYMENT_ENABLE_MIDTRANS: optionalBooleanString,
    RESEND_API_KEY: optionalString,
    SANITY_API_VERSION: optionalString,
    SANITY_DATASET: optionalString,
    SANITY_PROJECT_ID: optionalString,
    SUPABASE_ANON_KEY: optionalString,
    SUPABASE_SERVICE_ROLE_KEY: optionalString,
    SUPABASE_URL: optionalUrl,
  },
  client: {
    NEXT_PUBLIC_EVENT_DATE: optionalString,
    NEXT_PUBLIC_SANITY_API_VERSION: optionalString,
    NEXT_PUBLIC_SANITY_DATASET: optionalString,
    NEXT_PUBLIC_SANITY_PROJECT_ID: optionalString,
    NEXT_PUBLIC_SITE_URL: optionalUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalString,
    NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
  },
  emptyStringAsUndefined: true,
  runtimeEnv: {
    ADMIN_EMAILS: process.env.ADMIN_EMAILS,
    MIDTRANS_IS_PRODUCTION: process.env.MIDTRANS_IS_PRODUCTION,
    MIDTRANS_SERVER_KEY: process.env.MIDTRANS_SERVER_KEY,
    NEXT_PUBLIC_EVENT_DATE: process.env.NEXT_PUBLIC_EVENT_DATE,
    NEXT_PUBLIC_SANITY_API_VERSION: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
    NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
    NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    PAYMENT_ENABLE_MIDTRANS: process.env.PAYMENT_ENABLE_MIDTRANS,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    SANITY_API_VERSION: process.env.SANITY_API_VERSION,
    SANITY_DATASET: process.env.SANITY_DATASET,
    SANITY_PROJECT_ID: process.env.SANITY_PROJECT_ID,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_URL: process.env.SUPABASE_URL,
  },
})
