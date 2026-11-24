import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') || ''

    if (!q.trim()) {
      return NextResponse.json({ suggestions: [] })
    }

    const matches = await db.anime.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { titleEnglish: { contains: q, mode: 'insensitive' } },
          { titleRomaji: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 6,
      select: {
        id: true,
        title: true,
        titleEnglish: true,
        slug: true,
        poster: true,
        type: true,
        year: true,
      },
    })

    return NextResponse.json({ suggestions: matches })
  } catch {
    return NextResponse.json({ suggestions: [] })
  }
}
