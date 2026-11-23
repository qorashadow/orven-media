import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'

const db = new PrismaClient()

const POPULAR_ANIME_LIST = [
  { id: 16498, title: 'Attack on Titan', type: 'TV', category: 'ANIME', year: 2013, score: 90, eps: 25 },
  { id: 101922, title: 'Demon Slayer: Kimetsu no Yaiba', type: 'TV', category: 'ANIME', year: 2019, score: 87, eps: 26 },
  { id: 113415, title: 'Jujutsu Kaisen', type: 'TV', category: 'ANIME', year: 2020, score: 86, eps: 24 },
  { id: 21, title: 'One Piece', type: 'TV', category: 'ANIME', year: 1999, score: 88, eps: 1100 },
  { id: 1735, title: 'Naruto: Shippuden', type: 'TV', category: 'ANIME', year: 2007, score: 82, eps: 500 },
  { id: 1535, title: 'Death Note', type: 'TV', category: 'ANIME', year: 2006, score: 87, eps: 37 },
  { id: 5114, title: 'Fullmetal Alchemist: Brotherhood', type: 'TV', category: 'ANIME', year: 2009, score: 91, eps: 64 },
  { id: 21459, title: 'My Hero Academia', type: 'TV', category: 'ANIME', year: 2016, score: 80, eps: 13 },
  { id: 21087, title: 'One Punch Man', type: 'TV', category: 'ANIME', year: 2015, score: 86, eps: 12 },
  { id: 21507, title: 'Mob Psycho 100', type: 'TV', category: 'ANIME', year: 2016, score: 85, eps: 12 },
  { id: 11061, title: 'Hunter x Hunter (2011)', type: 'TV', category: 'ANIME', year: 2011, score: 90, eps: 148 },
  { id: 9253, title: 'Steins;Gate', type: 'TV', category: 'ANIME', year: 2011, score: 90, eps: 24 },
  { id: 1575, title: 'Code Geass: Lelouch of the Rebellion', type: 'TV', category: 'ANIME', year: 2006, score: 87, eps: 25 },
  { id: 1, title: 'Cowboy Bebop', type: 'TV', category: 'ANIME', year: 1998, score: 88, eps: 26 },
  { id: 30, title: 'Neon Genesis Evangelion', type: 'TV', category: 'ANIME', year: 1995, score: 83, eps: 26 },
  { id: 101348, title: 'Vinland Saga', type: 'TV', category: 'ANIME', year: 2019, score: 88, eps: 24 },
  { id: 127230, title: 'Chainsaw Man', type: 'TV', category: 'ANIME', year: 2022, score: 85, eps: 12 },
  { id: 140960, title: 'Spy x Family', type: 'TV', category: 'ANIME', year: 2022, score: 84, eps: 12 },
  { id: 20605, title: 'Tokyo Ghoul', type: 'TV', category: 'ANIME', year: 2014, score: 76, eps: 12 },
  { id: 11757, title: 'Sword Art Online', type: 'TV', category: 'ANIME', year: 2012, score: 72, eps: 25 },
  { id: 21355, title: 'Re:ZERO -Starting Life in Another World-', type: 'TV', category: 'ANIME', year: 2016, score: 83, eps: 25 },
  { id: 20832, title: 'Overlord', type: 'TV', category: 'ANIME', year: 2015, score: 80, eps: 13 },
  { id: 813, title: 'Dragon Ball Z', type: 'TV', category: 'ANIME', year: 1989, score: 82, eps: 291 },
  { id: 269, title: 'Bleach', type: 'TV', category: 'ANIME', year: 2004, score: 79, eps: 366 },
  { id: 97986, title: 'Made in Abyss', type: 'TV', category: 'ANIME', year: 2017, score: 87, eps: 13 },
  { id: 20464, title: 'Haikyuu!!', type: 'TV', category: 'ANIME', year: 2014, score: 86, eps: 25 },
  { id: 21827, title: 'Violet Evergarden', type: 'TV', category: 'ANIME', year: 2018, score: 87, eps: 13 },
  { id: 146065, title: 'Mushoku Tensei: Jobless Reincarnation', type: 'TV', category: 'ANIME', year: 2021, score: 84, eps: 11 },
  { id: 139825, title: 'Bocchi the Rock!', type: 'TV', category: 'ANIME', year: 2022, score: 88, eps: 12 },
  { id: 154587, title: 'Frieren: Beyond Journey\'s End', type: 'TV', category: 'ANIME', year: 2023, score: 94, eps: 28 },
  { id: 151807, title: 'Solo Leveling', type: 'TV', category: 'ANIME', year: 2024, score: 85, eps: 12 },
  { id: 171018, title: 'Dandadan', type: 'TV', category: 'ANIME', year: 2024, score: 87, eps: 12 },
  { id: 137822, title: 'Blue Lock', type: 'TV', category: 'ANIME', year: 2022, score: 81, eps: 24 },
  { id: 120120, title: 'Tokyo Revengers', type: 'TV', category: 'ANIME', year: 2021, score: 80, eps: 24 },
  { id: 105333, title: 'Dr. STONE', type: 'TV', category: 'ANIME', year: 2019, score: 82, eps: 24 },
  { id: 101759, title: 'The Promised Neverland', type: 'TV', category: 'ANIME', year: 2019, score: 84, eps: 12 },
  { id: 101347, title: 'Dororo', type: 'TV', category: 'ANIME', year: 2019, score: 82, eps: 24 },
  { id: 21234, title: 'ERASED', type: 'TV', category: 'ANIME', year: 2016, score: 84, eps: 12 },
  { id: 116589, title: '86 EIGHTY-SIX', type: 'TV', category: 'ANIME', year: 2021, score: 86, eps: 11 },
  { id: 98436, title: 'Black Clover', type: 'TV', category: 'ANIME', year: 2017, score: 79, eps: 170 },
]

const DONGHUA_LIST = [
  { id: 101321, title: 'Soul Land (Douluo Dalu)', type: 'ONA', category: 'DONGHUA', year: 2018, score: 82, eps: 250 },
  { id: 101926, title: 'Battle Through the Heavens (Fights Break Sphere)', type: 'ONA', category: 'DONGHUA', year: 2017, score: 80, eps: 120 },
  { id: 113545, title: 'The Daily Life of the Immortal King', type: 'ONA', category: 'DONGHUA', year: 2020, score: 76, eps: 15 },
  { id: 107089, title: 'Scissor Seven (Cike Wu Liuqi)', type: 'ONA', category: 'DONGHUA', year: 2018, score: 84, eps: 14 },
  { id: 124916, title: 'Link Click (Shiguang Dailiren)', type: 'ONA', category: 'DONGHUA', year: 2021, score: 89, eps: 11 },
  { id: 114857, title: 'Fog Hill of Five Elements', type: 'ONA', category: 'DONGHUA', year: 2020, score: 82, eps: 3 },
  { id: 101972, title: 'Grandmaster of Demonic Cultivation (Mo Dao Zu Shi)', type: 'ONA', category: 'DONGHUA', year: 2018, score: 85, eps: 15 },
  { id: 113260, title: 'Heaven Official\'s Blessing (Tian Guan Ci Fu)', type: 'ONA', category: 'DONGHUA', year: 2020, score: 84, eps: 11 },
  { id: 114232, title: 'A Record of a Mortal\'s Journey to Immortality', type: 'ONA', category: 'DONGHUA', year: 2020, score: 84, eps: 72 },
  { id: 108310, title: 'Swallowed Star (Tunshi Xingkong)', type: 'ONA', category: 'DONGHUA', year: 2020, score: 81, eps: 85 },
  { id: 119506, title: 'Perfect World (Wanmei Shijie)', type: 'ONA', category: 'DONGHUA', year: 2021, score: 83, eps: 130 },
  { id: 131518, title: 'Stellar Transformation (Xingchen Bian)', type: 'ONA', category: 'DONGHUA', year: 2018, score: 78, eps: 52 },
  { id: 168673, title: 'Against the Gods', type: 'ONA', category: 'DONGHUA', year: 2023, score: 79, eps: 30 },
  { id: 106883, title: 'Martial Universe (Wu Dong Qian Kun)', type: 'ONA', category: 'DONGHUA', year: 2019, score: 80, eps: 48 },
  { id: 101038, title: 'Tales of Demons and Gods (Yao Shen Ji)', type: 'ONA', category: 'DONGHUA', year: 2017, score: 75, eps: 150 },
]

const GENRE_NAMES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror',
  'Mecha', 'Music', 'Mystery', 'Psychological', 'Romance', 'Sci-Fi',
  'Slice of Life', 'Sports', 'Supernatural', 'Thriller', 'Isekai',
  'Martial Arts', 'Historical', 'Cultivation',
]

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function fetchAniListMedia(idOrSearch: number | string) {
  const isId = typeof idOrSearch === 'number'
  const query = isId
    ? `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        id
        title { romaji english native }
        description
        coverImage { extraLarge large }
        bannerImage
        genres
        studios(isMain: true) { nodes { name } }
        averageScore
        popularity
        episodes
        status
        seasonYear
        season
        format
        duration
        trailer { id site }
        characters(sort: ROLE, perPage: 6) {
          nodes { name { full native } image { large } }
        }
      }
    }
  `
    : `
    query ($search: String) {
      Page(page: 1, perPage: 1) {
        media(search: $search, type: ANIME) {
          id
          title { romaji english native }
          description
          coverImage { extraLarge large }
          bannerImage
          genres
          studios(isMain: true) { nodes { name } }
          averageScore
          popularity
          episodes
          status
          seasonYear
          season
          format
          duration
          trailer { id site }
          characters(sort: ROLE, perPage: 6) {
            nodes { name { full native } image { large } }
          }
        }
      }
    }
  `

  try {
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ query, variables: isId ? { id: idOrSearch } : { search: idOrSearch } }),
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return null
    const json = await res.json()
    return isId ? json?.data?.Media : json?.data?.Page?.media?.[0] || null
  } catch {
    return null
  }
}

async function main() {
  console.log('--- STARTING ORVEN MEDIA SEED SCRIPT ---')

  // 1. Create Default Users (Production vs Development)
  console.log('1. Checking user provisioning...')
  const isProduction = process.env.NODE_ENV === 'production'

  if (isProduction) {
    const prodAdminEmail = process.env.ADMIN_EMAIL || 'admin@orven.media'
    const prodAdminPassword = process.env.ADMIN_PASSWORD

    if (prodAdminPassword) {
      const adminPassword = await bcryptjs.hash(prodAdminPassword, 10)
      await db.user.upsert({
        where: { email: prodAdminEmail },
        update: { role: 'ADMIN', password: adminPassword, emailVerified: new Date() },
        create: {
          email: prodAdminEmail,
          username: 'admin',
          name: 'Orven Administrator',
          password: adminPassword,
          role: 'ADMIN',
          emailVerified: new Date(),
        },
      })
      console.log(`[SEED PRODUCTION] Provisioned admin: ${prodAdminEmail}`)
    } else {
      console.log('[SEED PRODUCTION] ADMIN_PASSWORD not specified; skipping default user creation.')
    }
  } else {
    // Development Default Users
    const adminPassword = await bcryptjs.hash('Admin123!', 10)
    const userPassword = await bcryptjs.hash('User123!', 10)

    await db.user.upsert({
      where: { email: 'admin@orven.media' },
      update: { role: 'ADMIN', emailVerified: new Date() },
      create: {
        email: 'admin@orven.media',
        username: 'admin',
        name: 'Orven Administrator',
        password: adminPassword,
        role: 'ADMIN',
        emailVerified: new Date(),
      },
    })

    await db.user.upsert({
      where: { email: 'user@orven.media' },
      update: { emailVerified: new Date() },
      create: {
        email: 'user@orven.media',
        username: 'testuser',
        name: 'Anime Enthusiast',
        password: userPassword,
        role: 'USER',
        emailVerified: new Date(),
      },
    })
    console.log('Development Admin user: admin@orven.media / Admin123!')
    console.log('Development Test user: user@orven.media / User123!')
  }

  // 2. Create Genres
  console.log('2. Creating genres...')
  const genreMap = new Map<string, string>()
  for (const g of GENRE_NAMES) {
    const slug = slugify(g)
    const genre = await db.genre.upsert({
      where: { slug },
      update: {},
      create: { name: g, slug },
    })
    genreMap.set(g.toLowerCase(), genre.id)
  }

  // 3. Process All Anime & Donghua
  const allTitles = [...POPULAR_ANIME_LIST, ...DONGHUA_LIST]
  console.log(`3. Importing ${allTitles.length} anime and donghua titles...`)

  const testVideoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'

  let index = 0
  for (const item of allTitles) {
    index++
    const isSpotlight = index <= 5 // first 5 titles in spotlight

    console.log(`[${index}/${allTitles.length}] Processing "${item.title}"...`)

    let mediaData: any = await fetchAniListMedia(item.id)
    await new Promise((r) => setTimeout(r, 600))
    if (!mediaData) {
      mediaData = await fetchAniListMedia(item.title.replace(/\s*\([^)]*\)/g, ''))
      await new Promise((r) => setTimeout(r, 600))
    }

    const title = mediaData?.title?.english || mediaData?.title?.romaji || item.title
    const slug = slugify(title)

    // Poster fallback to AniList standard CDN
    const poster =
      mediaData?.coverImage?.extraLarge ||
      mediaData?.coverImage?.large ||
      null
    const banner = mediaData?.bannerImage || poster || null

    const synopsis =
      mediaData?.description?.replace(/<[^>]*>/g, '') ||
      `${title} is a renowned ${item.category.toLowerCase()} series celebrated by animation fans worldwide for its exceptional storytelling, high visual fidelity, and compelling characters.`

    // Upsert Anime
    const anime = await db.anime.upsert({
      where: { slug },
      update: {
        isSpotlight,
        spotlightOrder: isSpotlight ? index : null,
      },
      create: {
        title,
        titleEnglish: mediaData?.title?.english || item.title,
        titleRomaji: mediaData?.title?.romaji || null,
        titleNative: mediaData?.title?.native || null,
        slug,
        synopsis,
        poster,
        banner,
        trailer: mediaData?.trailer?.site === 'youtube' ? `https://www.youtube.com/watch?v=${mediaData.trailer.id}` : null,
        type: item.type,
        category: item.category,
        status: 'COMPLETED',
        season: mediaData?.season || 'FALL',
        year: mediaData?.seasonYear || item.year,
        totalEpisodes: item.eps,
        duration: mediaData?.duration || 24,
        averageScore: mediaData?.averageScore || item.score,
        popularity: mediaData?.popularity || 10000 - index * 100,
        views: Math.floor(Math.random() * 25000) + 5000,
        isSpotlight,
        spotlightOrder: isSpotlight ? index : null,
        anilistId: item.id < 900000 ? item.id : null,
      },
    })

    // Connect Genres
    const itemGenres = mediaData?.genres?.length
      ? mediaData.genres
      : [item.category === 'DONGHUA' ? 'Cultivation' : 'Action', 'Fantasy']

    for (const gName of itemGenres) {
      const gId = genreMap.get(gName.toLowerCase()) || genreMap.get('action')
      if (gId) {
        await db.animeGenre.upsert({
          where: { animeId_genreId: { animeId: anime.id, genreId: gId } },
          update: {},
          create: { animeId: anime.id, genreId: gId },
        }).catch(() => {})
      }
    }

    // Create 3 working test episodes for each anime
    for (let epNum = 1; epNum <= 3; epNum++) {
      const ep = await db.episode.upsert({
        where: { animeId_number: { animeId: anime.id, number: epNum } },
        update: {},
        create: {
          animeId: anime.id,
          number: epNum,
          title: `Episode ${epNum}: The Awakening`,
          duration: 1440, // 24m
          videoUrl: testVideoUrl,
          videoType: 'mp4',
          introStart: 90,
          introEnd: 180,
          outroStart: 1320,
        },
      })

      // Add default server if not existing
      const existingServer = await db.videoServer.findFirst({
        where: { episodeId: ep.id },
      })
      if (!existingServer) {
        await db.videoServer.create({
          data: {
            episodeId: ep.id,
            name: 'Server 1 (Direct HD)',
            url: testVideoUrl,
            type: 'mp4',
            quality: '1080p',
            language: 'sub',
            isDefault: true,
          },
        }).catch(() => {})
      }
    }

    // Add Characters if provided
    if (mediaData?.characters?.nodes?.length) {
      for (const char of mediaData.characters.nodes) {
        if (!char.name?.full) continue
        let character = await db.character.findFirst({
          where: { name: char.name.full },
        })
        if (!character) {
          character = await db.character.create({
            data: {
              name: char.name.full,
              nameNative: char.name.native,
              image: char.image?.large,
            },
          })
        }
        await db.animeCharacter.upsert({
          where: { animeId_characterId: { animeId: anime.id, characterId: character.id } },
          update: {},
          create: {
            animeId: anime.id,
            characterId: character.id,
            role: 'MAIN',
          },
        }).catch(() => {})
      }
    }
  }

  // 4. Create sample Schedule entries
  console.log('4. Creating airing schedule...')
  const spotlightAnimeList = await db.anime.findMany({ take: 7 })
  const now = new Date()
  for (let i = 0; i < spotlightAnimeList.length; i++) {
    const existingSched = await db.schedule.findFirst({
      where: { animeId: spotlightAnimeList[i].id },
    })
    if (!existingSched) {
      const airingDate = new Date(now.getTime() + (i * 24 + 4) * 3600 * 1000)
      await db.schedule.create({
        data: {
          animeId: spotlightAnimeList[i].id,
          episodeNumber: 12,
          airingAt: airingDate,
        },
      }).catch(() => {})
    }
  }

  // 5. Create Announcements
  console.log('5. Creating sample announcements...')
  const existingAnnounce = await db.announcement.findFirst({
    where: { title: 'Welcome to Orven Media' },
  })
  if (!existingAnnounce) {
    await db.announcement.create({
      data: {
        title: 'Welcome to Orven Media',
        content: 'Enjoy high-speed anime & donghua streams with zero ads and multi-language subtitles.',
        type: 'INFO',
        active: true,
      },
    })
  }

  // 6. Create News Article
  const existingNews = await db.news.findFirst({
    where: { slug: 'orven-media-1-0-launch' },
  })
  if (!existingNews) {
    await db.news.create({
      data: {
        title: 'Orven Media 1.0 Officially Launched',
        slug: 'orven-media-1-0-launch',
        content: 'We are thrilled to unveil Orven Media — a brand new streaming platform designed specifically for anime and donghua fans.',
        published: true,
      },
    }).catch(() => {})
  }

  console.log('--- DATABASE SEEDING COMPLETED SUCCESSFULLY ---')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
