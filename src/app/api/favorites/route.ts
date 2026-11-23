import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ favorites: [] })

    const favorites = await db.favorite.findMany({
      where: { userId: session.user.id },
      include: {
        anime: {
          include: { genres: { include: { genre: true } } },
        },
      },
    })

    return NextResponse.json({ favorites })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { animeId } = await req.json()
    if (!animeId) {
      return NextResponse.json({ error: 'Missing animeId' }, { status: 400 })
    }

    const existing = await db.favorite.findUnique({
      where: {
        userId_animeId: {
          userId: session.user.id,
          animeId,
        },
      },
    })

    if (existing) {
      await db.favorite.delete({ where: { id: existing.id } })
      await db.anime.update({
        where: { id: animeId },
        data: { favorites: { decrement: 1 } },
      }).catch(() => {})

      return NextResponse.json({ favorited: false })
    } else {
      await db.favorite.create({
        data: {
          userId: session.user.id,
          animeId,
        },
      })
      await db.anime.update({
        where: { id: animeId },
        data: { favorites: { increment: 1 } },
      }).catch(() => {})

      return NextResponse.json({ favorited: true })
    }
  } catch {
    return NextResponse.json({ error: 'Failed to update favorite' }, { status: 500 })
  }
}
