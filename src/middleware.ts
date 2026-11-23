import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Security headers
  const response = NextResponse.next()
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')

  // Admin route protection
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('authjs.session-token') ||
                  request.cookies.get('__Secure-authjs.session-token')
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login?callbackUrl=' + encodeURIComponent(pathname), request.url))
    }
  }

  // Protected routes
  const protectedPaths = ['/settings', '/notifications']
  if (protectedPaths.some(p => pathname.startsWith(p))) {
    const token = request.cookies.get('authjs.session-token') ||
                  request.cookies.get('__Secure-authjs.session-token')
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login?callbackUrl=' + encodeURIComponent(pathname), request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/settings/:path*', '/notifications/:path*'],
}
