import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Security headers
  const response = NextResponse.next()
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')

  // Check authentication token with next-auth/jwt
  const secret =
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    'orven-media-production-auth-secret-key-fallback-32b'

  let token = await getToken({
    req: request,
    secret,
    cookieName: '__Secure-authjs.session-token',
  })

  if (!token) {
    token = await getToken({
      req: request,
      secret,
      cookieName: 'authjs.session-token',
    })
  }

  if (!token) {
    token = await getToken({
      req: request,
      secret,
    })
  }

  // Admin route protection: must be logged in AND role === 'ADMIN'
  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(
        new URL('/auth/login?callbackUrl=' + encodeURIComponent(pathname), request.url)
      )
    }

    if (token.role !== 'ADMIN') {
      // Forbidden: redirect regular users to home
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Protected routes for authenticated users
  const protectedPaths = ['/settings', '/notifications']
  if (protectedPaths.some((p) => pathname.startsWith(p))) {
    if (!token) {
      return NextResponse.redirect(
        new URL('/auth/login?callbackUrl=' + encodeURIComponent(pathname), request.url)
      )
    }
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/settings/:path*', '/notifications/:path*'],
}
