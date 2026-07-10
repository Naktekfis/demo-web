import { NextRequest, NextResponse } from 'next/server'

export function GET(request: NextRequest) {
  const url = new URL('/favicon.ico', request.url)
  return NextResponse.redirect(url, {
    status: 308,
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
