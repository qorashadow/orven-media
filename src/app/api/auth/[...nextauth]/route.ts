import { handlers } from '@/lib/auth'
import { NextRequest } from 'next/server'

function createNextRequest(req: Request): NextRequest {
  if (req instanceof NextRequest) return req

  const host = req.headers.get('x-forwarded-host') || req.headers.get('host')
  const proto = req.headers.get('x-forwarded-proto') || (req.url.startsWith('https') ? 'https' : 'http')

  let targetUrl = req.url
  if (host && (targetUrl.includes('localhost') || targetUrl.startsWith('http://'))) {
    try {
      const u = new URL(req.url)
      u.host = host
      u.protocol = proto
      targetUrl = u.toString()
    } catch {}
  }

  return new NextRequest(targetUrl, req)
}

export async function GET(req: Request) {
  return handlers.GET(createNextRequest(req))
}

export async function POST(req: Request) {
  return handlers.POST(createNextRequest(req))
}
