import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { getAniListAnime, mapAniListFormat, mapAniListStatus, getTrailerUrl } from '@/lib/api'
import { slugify } from '@/lib/utils'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { anilistId } = await req.json()
    if (!anilistId) {
      return NextResponse.json({ error: 'AniList ID is required' }, { status: 400 })
    }

    const media = await getAniListAnime(Number(anilistId))
    if (!media) {
      return NextResponse.json({ error: 'Anime not found on AniList' }, { status: 404 })
    }

    const title = media.title.english || media.title.romaji || media.title.native || 'Untitled'
    const baseSlug = slugify(title)
    let slug = baseSlug
    let counter = 1
    while (await db.anime.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`
    }

    // Upsert genres
    const genreRecords = await Promise.all(
      media.genres.map(async (genreName) => {
        const genreSlug = slugify(genreName)
        return db.genre.upsert({
          where: { slug: genreSlug },
          update: { name: genreName },
          create: { name: genreName, slug: genreSlug },
        })
      })
    )

    // Upsert studio
    let studioRecord = null
    const mainStudio = media.studios.nodes[0]
    if (mainStudio) {
      const studioSlug = slugify(mainStudio.name)
      studioRecord = await db.studio.upsert({
        where: { slug: studioSlug },
        update: { name: mainStudio.name },
        create: { name: mainStudio.name, slug: studioSlug },
      })
    }

    // Determine category: Chinese anime is Donghua
    const isDonghua =
      media.title.native && /[\u4e00-\u9fa5]/.test(media.title.native) && !/[\u3040-\u30ff]/.test(media.title.native)
    const category = isDonghua ? 'DONGHUA' : 'ANIME'

    const anime = await db.anime.create({
      data: {
        title,
        titleEnglish: media.title.english,
        titleRomaji: media.title.romaji,
        titleNative: media.title.native,
        slug,
        synopsis: media.description ? media.description.replace(/<[^>]*>/g, '') : null,
        poster: media.coverImage.extraLarge || media.coverImage.large,
        banner: media.bannerImage,
        trailer: getTrailerUrl(media.trailer),
        type: mapAniListFormat(media.format),
        category,
        status: mapAniListStatus(media.status),
        season: media.season,
        year: media.seasonYear,
        totalEpisodes: media.episodes,
        duration: media.duration,
        averageScore: media.averageScore,
        popularity: media.popularity || 0,
        favorites: media.favourites || 0,
        trending: media.trending || 0,
        anilistId: media.id,
        genres: {
          create: genreRecords.map((g) => ({ genreId: g.id })),
        },
        studios: studioRecord
          ? {
              create: [{ studioId: studioRecord.id }],
            }
          : undefined,
      },
    })

    // Create characters
    if (media.characters?.nodes?.length > 0) {
      for (const char of media.characters.nodes.slice(0, 8)) {
        if (!char.name.full) continue
        const character = await db.character.create({
          data: {
            name: char.name.full,
            nameNative: char.name.native,
            image: char.image?.large,
          },
        })
        await db.animeCharacter.create({
          data: {
            animeId: anime.id,
            characterId: character.id,
            role: 'MAIN',
          },
        }).catch(() => {})
      }
    }

    return NextResponse.json({ success: true, anime }, { status: 201 })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json({ error: 'Failed to import anime' }, { status: 500 })
  }
}
