import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const spotlights = await db.anime.findMany({
      where: { isSpotlight: true },
      orderBy: { spotlightOrder: 'asc' },
      select: {
        id: true,
        title: true,
        poster: true,
        spotlightOrder: true,
      },
    })
    return NextResponse.json({ spotlights })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch spotlights' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { animeId, order } = await req.json()
    await db.anime.update({
      where: { id: animeId },
      data: { isSpotlight: true, spotlightOrder: Number(order) || 1 },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to add spotlight' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const animeId = searchParams.get('animeId')
    if (!animeId) return NextResponse.json({ error: 'Missing animeId' }, { status: 400 })

    await db.anime.update({
      where: { id: animeId },
      data: { isSpotlight: false, spotlightOrder: null },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to remove spotlight' }, { status: 500 })
  }
}
