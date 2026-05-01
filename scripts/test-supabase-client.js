const fs = require('fs')
const path = require('path')

function loadEnv(file) {
  const p = path.resolve(file)
  if (!fs.existsSync(p)) return
  const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/)
  for (const line of lines) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)=(.*)$/)
    if (m) {
      const k = m[1]
      let v = m[2] || ''
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1)
      }
      process.env[k] = v
    }
  }
}

loadEnv('.env.local')

const { createClient } = require('@supabase/supabase-js')

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url) {
  console.error('Missing SUPABASE URL in .env.local')
  process.exit(2)
}
if (!serviceKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(3)
}

(async () => {
  try {
    const supabase = createClient(url, serviceKey)
    console.log('Using service role key to list users (may be empty)')
    const res = await supabase.auth.admin.listUsers({})
    console.log('status:', res?.error ? 'error' : 'ok')
    if (res?.data) console.log('users count (sample):', res.data.length)
    if (res?.error) console.error('error:', res.error.message)
    process.exit(0)
  } catch (err) {
    console.error('Test failed:', err && err.message ? err.message : err)
    process.exit(4)
  }
})()
