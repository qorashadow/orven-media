import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 24
    const skip = (page - 1) * limit

    if (!q.trim()) {
      return NextResponse.json({ items: [], total: 0, totalPages: 0 })
    }

    const where = {
      OR: [
        { title: { contains: q, mode: 'insensitive' as const } },
        { titleEnglish: { contains: q, mode: 'insensitive' as const } },
        { titleRomaji: { contains: q, mode: 'insensitive' as const } },
        { titleNative: { contains: q, mode: 'insensitive' as const } },
      ],
    }

    const [items, total] = await Promise.all([
      db.anime.findMany({
        where,
        skip,
        take: limit,
        orderBy: { popularity: 'desc' },
        include: {
          genres: { include: { genre: true } },
        },
      }),
      db.anime.count({ where }),
    ])

    return NextResponse.json({
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
