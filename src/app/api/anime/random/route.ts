import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const count = await db.anime.count()
    if (count === 0) {
      return NextResponse.json({ error: 'No anime found' }, { status: 404 })
    }

    const skip = Math.floor(Math.random() * count)
    const randomAnime = await db.anime.findFirst({
      skip,
      include: {
        genres: { include: { genre: true } },
        studios: { include: { studio: true } },
      },
    })

    return NextResponse.json(randomAnime || {})
  } catch {
    return NextResponse.json({ error: 'Failed to get random anime' }, { status: 500 })
  }
}
