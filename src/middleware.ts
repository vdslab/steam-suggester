import { NextResponse, userAgent } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { device } = userAgent(request)
  const viewport = device.type === 'mobile' ? 'mobile' : 'desktop'

  if (viewport === 'mobile') {
    return NextResponse.redirect(new URL('/mobile', request.url));
  } else {
    return NextResponse.redirect(new URL('/desktop', request.url));
  }
}
 
export const config = {
  matcher: ['/']
}