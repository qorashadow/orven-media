import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { animeId, episodeId, progress, duration, completed } = await req.json()

    if (!animeId || !episodeId) {
      return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 })
    }

    // Upsert watch history
    const history = await db.watchHistory.upsert({
      where: {
        userId_episodeId: {
          userId: session.user.id,
          episodeId,
        },
      },
      update: {
        progress: Number(progress) || 0,
        duration: Number(duration) || 0,
        completed: Boolean(completed),
        watchedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        animeId,
        episodeId,
        progress: Number(progress) || 0,
        duration: Number(duration) || 0,
        completed: Boolean(completed),
      },
    })

    // Also update views on anime
    await db.anime.update({
      where: { id: animeId },
      data: { views: { increment: 1 } },
    }).catch(() => {})

    return NextResponse.json({ success: true, history })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to save progress' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, progress: 0 })
    }

    const { searchParams } = new URL(req.url)
    const episodeId = searchParams.get('episodeId')

    if (!episodeId) {
      return NextResponse.json({ success: false, progress: 0 })
    }

    const history = await db.watchHistory.findUnique({
      where: {
        userId_episodeId: {
          userId: session.user.id,
          episodeId,
        },
      },
    })

    return NextResponse.json({
      success: true,
      progress: history?.progress || 0,
      completed: history?.completed || false,
    })
  } catch {
    return NextResponse.json({ success: false, progress: 0 })
  }
}
