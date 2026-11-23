import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ items: [] })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const where: any = { userId: session.user.id }
    if (status) where.status = status

    const items = await db.watchlistEntry.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        anime: {
          include: {
            genres: { include: { genre: true } },
          },
        },
      },
    })

    return NextResponse.json({ items })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch watchlist' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { animeId, status, episodesWatched } = await req.json()
    if (!animeId) {
      return NextResponse.json({ error: 'Missing animeId' }, { status: 400 })
    }

    const entry = await db.watchlistEntry.upsert({
      where: {
        userId_animeId: {
          userId: session.user.id,
          animeId,
        },
      },
      update: {
        status: status || 'PLAN_TO_WATCH',
        episodesWatched: episodesWatched !== undefined ? Number(episodesWatched) : undefined,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        animeId,
        status: status || 'PLAN_TO_WATCH',
        episodesWatched: episodesWatched !== undefined ? Number(episodesWatched) : 0,
      },
    })

    return NextResponse.json({ success: true, entry })
  } catch {
    return NextResponse.json({ error: 'Failed to update watchlist' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const animeId = searchParams.get('animeId')
    if (!animeId) {
      return NextResponse.json({ error: 'Missing animeId' }, { status: 400 })
    }

    await db.watchlistEntry.delete({
      where: {
        userId_animeId: {
          userId: session.user.id,
          animeId,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to remove from watchlist' }, { status: 500 })
  }
}
