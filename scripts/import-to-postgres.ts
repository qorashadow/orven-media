import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const db = new PrismaClient()

async function importData() {
  console.log('--- IMPORTING SQLITE DATA INTO POSTGRESQL / NEON ---')
  const filePath = path.join(process.cwd(), 'prisma', 'sqlite-export.json')

  if (!fs.existsSync(filePath)) {
    console.error(`Error: Export file not found at ${filePath}.`)
    console.error('Run: node scripts/export-sqlite-data.mjs first.')
    process.exit(1)
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const dump = JSON.parse(fileContent)
  const { data } = dump

  console.log(`Loaded export snapshot from: ${dump.exportedAt}`)
  const startTime = Date.now()

  // 1. Genres
  console.log(`Importing ${data.genres.length} genres...`)
  for (const g of data.genres) {
    await db.genre.upsert({
      where: { id: g.id },
      update: { name: g.name, slug: g.slug },
      create: { id: g.id, name: g.name, slug: g.slug },
    }).catch((e) => console.error(`Genre error (${g.name}):`, e.message))
  }

  // 2. Studios
  if (data.studios?.length > 0) {
    console.log(`Importing ${data.studios.length} studios...`)
    for (const s of data.studios) {
      await db.studio.upsert({
        where: { id: s.id },
        update: { name: s.name, slug: s.slug },
        create: { id: s.id, name: s.name, slug: s.slug },
      }).catch((e) => console.error(`Studio error (${s.name}):`, e.message))
    }
  }

  // 3. Users
  console.log(`Importing ${data.users.length} users...`)
  for (const u of data.users) {
    await db.user.upsert({
      where: { id: u.id },
      update: {
        email: u.email,
        emailVerified: u.emailVerified ? new Date(u.emailVerified) : null,
        username: u.username,
        password: u.password,
        name: u.name,
        role: u.role,
        avatar: u.avatar,
        banner: u.banner,
        bio: u.bio,
        language: u.language,
        createdAt: new Date(u.createdAt),
        updatedAt: new Date(u.updatedAt),
      },
      create: {
        id: u.id,
        email: u.email,
        emailVerified: u.emailVerified ? new Date(u.emailVerified) : null,
        username: u.username,
        password: u.password,
        name: u.name,
        role: u.role,
        avatar: u.avatar,
        banner: u.banner,
        bio: u.bio,
        language: u.language,
        createdAt: new Date(u.createdAt),
        updatedAt: new Date(u.updatedAt),
      },
    }).catch((e) => console.error(`User error (${u.username}):`, e.message))
  }

  // 4. Anime
  console.log(`Importing ${data.anime.length} anime / donghua...`)
  for (const a of data.anime) {
    await db.anime.upsert({
      where: { id: a.id },
      update: {
        title: a.title,
        titleEnglish: a.titleEnglish,
        titleNative: a.titleNative,
        titleRomaji: a.titleRomaji,
        slug: a.slug,
        synopsis: a.synopsis,
        poster: a.poster,
        banner: a.banner,
        trailer: a.trailer,
        type: a.type,
        category: a.category,
        status: a.status,
        season: a.season,
        year: a.year,
        totalEpisodes: a.totalEpisodes,
        duration: a.duration,
        ageRating: a.ageRating,
        averageScore: a.averageScore,
        popularity: a.popularity,
        favorites: a.favorites,
        trending: a.trending,
        views: a.views,
        anilistId: a.anilistId,
        malId: a.malId,
        isNSFW: a.isNSFW,
        isSpotlight: a.isSpotlight,
        spotlightOrder: a.spotlightOrder,
        featured: a.featured,
        createdAt: new Date(a.createdAt),
        updatedAt: new Date(a.updatedAt),
      },
      create: {
        id: a.id,
        title: a.title,
        titleEnglish: a.titleEnglish,
        titleNative: a.titleNative,
        titleRomaji: a.titleRomaji,
        slug: a.slug,
        synopsis: a.synopsis,
        poster: a.poster,
        banner: a.banner,
        trailer: a.trailer,
        type: a.type,
        category: a.category,
        status: a.status,
        season: a.season,
        year: a.year,
        totalEpisodes: a.totalEpisodes,
        duration: a.duration,
        ageRating: a.ageRating,
        averageScore: a.averageScore,
        popularity: a.popularity,
        favorites: a.favorites,
        trending: a.trending,
        views: a.views,
        anilistId: a.anilistId,
        malId: a.malId,
        isNSFW: a.isNSFW,
        isSpotlight: a.isSpotlight,
        spotlightOrder: a.spotlightOrder,
        featured: a.featured,
        createdAt: new Date(a.createdAt),
        updatedAt: new Date(a.updatedAt),
      },
    }).catch((e) => console.error(`Anime error (${a.title}):`, e.message))
  }

  // 5. AnimeGenre Relations
  console.log(`Importing ${data.animeGenres.length} anime genre relations...`)
  for (const ag of data.animeGenres) {
    await db.animeGenre.upsert({
      where: {
        animeId_genreId: { animeId: ag.animeId, genreId: ag.genreId },
      },
      update: {},
      create: { animeId: ag.animeId, genreId: ag.genreId },
    }).catch(() => {})
  }

  // 6. Characters
  console.log(`Importing ${data.characters.length} characters...`)
  for (const c of data.characters) {
    await db.character.upsert({
      where: { id: c.id },
      update: { name: c.name, nameNative: c.nameNative, image: c.image },
      create: { id: c.id, name: c.name, nameNative: c.nameNative, image: c.image },
    }).catch(() => {})
  }

  // 7. AnimeCharacters
  console.log(`Importing ${data.animeCharacters.length} anime character links...`)
  for (const ac of data.animeCharacters) {
    await db.animeCharacter.upsert({
      where: {
        animeId_characterId: { animeId: ac.animeId, characterId: ac.characterId },
      },
      update: { role: ac.role },
      create: { animeId: ac.animeId, characterId: ac.characterId, role: ac.role },
    }).catch(() => {})
  }

  // 8. Episodes
  console.log(`Importing ${data.episodes.length} episodes...`)
  for (const ep of data.episodes) {
    await db.episode.upsert({
      where: { id: ep.id },
      update: {
        animeId: ep.animeId,
        number: ep.number,
        title: ep.title,
        thumbnail: ep.thumbnail,
        duration: ep.duration,
        videoUrl: ep.videoUrl,
        videoType: ep.videoType,
        introStart: ep.introStart,
        introEnd: ep.introEnd,
        outroStart: ep.outroStart,
        filler: ep.filler,
        recap: ep.recap,
        aired: ep.aired ? new Date(ep.aired) : null,
      },
      create: {
        id: ep.id,
        animeId: ep.animeId,
        number: ep.number,
        title: ep.title,
        thumbnail: ep.thumbnail,
        duration: ep.duration,
        videoUrl: ep.videoUrl,
        videoType: ep.videoType,
        introStart: ep.introStart,
        introEnd: ep.introEnd,
        outroStart: ep.outroStart,
        filler: ep.filler,
        recap: ep.recap,
        aired: ep.aired ? new Date(ep.aired) : null,
        createdAt: new Date(ep.createdAt),
        updatedAt: new Date(ep.updatedAt),
      },
    }).catch((e) => console.error(`Episode error (${ep.id}):`, e.message))
  }

  // 9. VideoServers
  console.log(`Importing ${data.videoServers.length} video servers...`)
  for (const vs of data.videoServers) {
    await db.videoServer.upsert({
      where: { id: vs.id },
      update: {
        episodeId: vs.episodeId,
        name: vs.name,
        url: vs.url,
        type: vs.type,
        quality: vs.quality,
        language: vs.language,
        isDefault: vs.isDefault,
      },
      create: {
        id: vs.id,
        episodeId: vs.episodeId,
        name: vs.name,
        url: vs.url,
        type: vs.type,
        quality: vs.quality,
        language: vs.language,
        isDefault: vs.isDefault,
      },
    }).catch(() => {})
  }

  // 10. Schedules
  console.log(`Importing ${data.schedules.length} schedule entries...`)
  for (const sc of data.schedules) {
    await db.schedule.upsert({
      where: { id: sc.id },
      update: {
        animeId: sc.animeId,
        episodeNumber: sc.episodeNumber,
        airingAt: new Date(sc.airingAt),
      },
      create: {
        id: sc.id,
        animeId: sc.animeId,
        episodeNumber: sc.episodeNumber,
        airingAt: new Date(sc.airingAt),
      },
    }).catch(() => {})
  }

  // 11. Announcements & News
  for (const a of data.announcements || []) {
    await db.announcement.upsert({
      where: { id: a.id },
      update: { title: a.title, content: a.content, type: a.type, active: a.active },
      create: {
        id: a.id,
        title: a.title,
        content: a.content,
        type: a.type,
        active: a.active,
        createdAt: new Date(a.createdAt),
      },
    }).catch(() => {})
  }

  for (const n of data.news || []) {
    await db.news.upsert({
      where: { id: n.id },
      update: { title: n.title, slug: n.slug, content: n.content, published: n.published },
      create: {
        id: n.id,
        title: n.title,
        slug: n.slug,
        content: n.content,
        published: n.published,
        createdAt: new Date(n.createdAt),
        updatedAt: new Date(n.updatedAt),
      },
    }).catch(() => {})
  }

  console.log(`\n--- DATA IMPORT COMPLETED IN ${Date.now() - startTime}ms ---`)
}

importData()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Import error:', err)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
