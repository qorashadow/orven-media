import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { animeSchema } from '@/lib/validations'
import { slugify } from '@/lib/utils'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '24'), 50)
    const skip = (page - 1) * limit

    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const genre = searchParams.get('genre')
    const status = searchParams.get('status')
    const season = searchParams.get('season')
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined
    const sort = searchParams.get('sort') || 'popular'
    const q = searchParams.get('q')

    const where: any = {}

    if (type) where.type = type
    if (category) where.category = category
    if (status) where.status = status
    if (season) where.season = season
    if (year) where.year = year

    if (genre) {
      const genreSlugs = genre.split(',').filter(Boolean)
      where.genres = {
        some: {
          genre: {
            slug: { in: genreSlugs },
          },
        },
      }
    }

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { titleEnglish: { contains: q } },
        { titleRomaji: { contains: q } },
        { titleNative: { contains: q } },
      ]
    }

    const orderBy: any = {}
    switch (sort) {
      case 'newest':
        orderBy.year = 'desc'
        break
      case 'score':
        orderBy.averageScore = 'desc'
        break
      case 'az':
        orderBy.title = 'asc'
        break
      case 'updated':
        orderBy.updatedAt = 'desc'
        break
      case 'trending':
        orderBy.trending = 'desc'
        break
      case 'popular':
      default:
        orderBy.popularity = 'desc'
        break
    }

    const [items, total] = await Promise.all([
      db.anime.findMany({
        where,
        skip,
        take: limit,
        orderBy,
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
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch anime' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
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
    const baseSlug = slugify(data.title)
    let slug = baseSlug
    let counter = 1
    while (await db.anime.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`
    }

    const anime = await db.anime.create({
      data: {
        title: data.title,
        titleEnglish: data.titleEnglish,
        titleNative: data.titleNative,
        titleRomaji: data.titleRomaji,
        slug,
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
        genres: data.genreIds
          ? {
              create: data.genreIds.map((id) => ({ genreId: id })),
            }
          : undefined,
        studios: data.studioIds
          ? {
              create: data.studioIds.map((id) => ({ studioId: id })),
            }
          : undefined,
      },
      include: {
        genres: { include: { genre: true } },
        studios: { include: { studio: true } },
      },
    })

    return NextResponse.json({ success: true, anime }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create anime' }, { status: 500 })
  }
}
