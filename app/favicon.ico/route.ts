const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#111827"/>
  <path d="M18 46V18h8v28h-8Zm14 0V18h14.5c6.3 0 10.5 3.8 10.5 9.4 0 3.6-1.8 6.4-5 7.9L58 46h-9.2l-5-9.3H40V46h-8Zm8-16h5.8c2.1 0 3.3-1 3.3-2.8s-1.2-2.8-3.3-2.8H40V30Z" fill="#f8fafc"/>
  <path d="M12 52h40" stroke="#6366f1" stroke-width="5" stroke-linecap="round"/>
</svg>`

export function GET() {
  return new Response(faviconSvg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
