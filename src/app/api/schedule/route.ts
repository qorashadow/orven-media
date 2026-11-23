import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const now = new Date()
    // Airing around this week
    const schedules = await db.schedule.findMany({
      orderBy: { airingAt: 'asc' },
      include: {
        anime: {
          select: {
            id: true,
            title: true,
            slug: true,
            poster: true,
            type: true,
          },
        },
      },
      take: 50,
    })

    return NextResponse.json({ schedules })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch schedule' }, { status: 500 })
  }
}
