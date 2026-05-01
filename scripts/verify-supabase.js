const fs = require('fs');
const path = require('path');

function loadEnv(file) {
  const p = path.resolve(file);
  if (!fs.existsSync(p)) return;
  const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)=(.*)$/);
    if (m) {
      const k = m[1];
      let v = m[2] || '';
      // strip surrounding quotes
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      process.env[k] = v;
    }
  }
}

loadEnv('.env.local');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('ERROR: SUPABASE URL not found in .env.local');
  process.exit(2);
}

(async () => {
  try {
    const endpoint = `${supabaseUrl.replace(/\/+$/,'')}/rest/v1/`;
    console.log('Pinging', endpoint);
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        apikey: anonKey || '',
        accept: '*/*'
      }
    });
    console.log('HTTP', res.status, res.statusText);
    const text = await res.text();
    console.log('Response snippet:', text.slice(0, 400));
    if (res.status >= 200 && res.status < 500) {
      console.log('Supabase endpoint reachable.');
      process.exit(0);
    } else {
      console.error('Unexpected status from Supabase endpoint.');
      process.exit(3);
    }
  } catch (err) {
    console.error('Fetch failed:', err.message);
    process.exit(4);
  }
})();
