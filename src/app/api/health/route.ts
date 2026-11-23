import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const startTime = Date.now()
  let dbStatus = 'disconnected'
  let dbLatency = 0

  try {
    const dbStart = Date.now()
    await db.$queryRaw`SELECT 1`
    dbLatency = Date.now() - dbStart
    dbStatus = 'connected'
  } catch (err: any) {
    dbStatus = `error: ${err.message || 'connection failed'}`
  }

  const isHealthy = dbStatus === 'connected'

  return NextResponse.json(
    {
      status: isHealthy ? 'healthy' : 'degraded',
      service: 'Orven Media API Gateway',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: dbStatus,
        latencyMs: dbLatency,
      },
      responseTimeMs: Date.now() - startTime,
    },
    {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  )
}
