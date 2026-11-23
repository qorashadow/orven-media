import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { animeSchema } from '@/lib/validations'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const anime = await db.anime.findUnique({
      where: { id },
      include: {
        genres: { include: { genre: true } },
        studios: { include: { studio: true } },
        episodes: { orderBy: { number: 'asc' } },
        characters: { include: { character: true } },
        relations: { include: { target: true } },
      },
    })

    if (!anime) return NextResponse.json({ error: 'Anime not found' }, { status: 404 })
    return NextResponse.json({ anime })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch anime' }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const validation = animeSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0]?.message }, { status: 400 })
    }

    const data = validation.data

    // Update genres and studios relationships
    if (data.genreIds) {
      await db.animeGenre.deleteMany({ where: { animeId: id } })
      await db.animeGenre.createMany({
        data: data.genreIds.map((genreId) => ({ animeId: id, genreId })),
      })
    }

    if (data.studioIds) {
      await db.animeStudio.deleteMany({ where: { animeId: id } })
      await db.animeStudio.createMany({
        data: data.studioIds.map((studioId) => ({ animeId: id, studioId })),
      })
    }

    const updated = await db.anime.update({
      where: { id },
      data: {
        title: data.title,
        titleEnglish: data.titleEnglish,
        titleNative: data.titleNative,
        titleRomaji: data.titleRomaji,
        synopsis: data.synopsis,
        poster: data.poster,
        banner: data.banner,
        trailer: data.trailer,
        type: data.type,
        category: data.category,
        status: data.status,
        season: data.season,
        year: data.year,
        totalEpisodes: data.totalEpisodes,
        duration: data.duration,
        ageRating: data.ageRating,
        averageScore: data.averageScore,
        isNSFW: data.isNSFW,
      },
      include: {
        genres: { include: { genre: true } },
        studios: { include: { studio: true } },
      },
    })

    return NextResponse.json({ success: true, anime: updated })
  } catch {
    return NextResponse.json({ error: 'Failed to update anime' }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await db.anime.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete anime' }, { status: 500 })
  }
}
