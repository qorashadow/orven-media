import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const db = new PrismaClient()

async function exportData() {
  console.log('--- EXPORTING SQLITE DATABASE TO JSON ---')
  const startTime = Date.now()

  const [
    users,
    genres,
    studios,
    anime,
    animeGenres,
    animeStudios,
    characters,
    animeCharacters,
    episodes,
    subtitles,
    videoServers,
    schedules,
    announcements,
    news,
    siteSettings,
    ratings,
    reviews,
    comments,
    commentLikes,
    favorites,
    watchlistEntries,
    watchHistory,
    reports,
    requests,
    notifications,
    animeRelations,
    recommendationSources,
  ] = await Promise.all([
    db.user.findMany(),
    db.genre.findMany(),
    db.studio.findMany(),
    db.anime.findMany(),
    db.animeGenre.findMany(),
    db.animeStudio.findMany(),
    db.character.findMany(),
    db.animeCharacter.findMany(),
    db.episode.findMany(),
    db.subtitle.findMany(),
    db.videoServer.findMany(),
    db.schedule.findMany(),
    db.announcement.findMany(),
    db.news.findMany(),
    db.siteSetting.findMany(),
    db.rating.findMany(),
    db.review.findMany(),
    db.comment.findMany(),
    db.commentLike.findMany(),
    db.favorite.findMany(),
    db.watchlistEntry.findMany(),
    db.watchHistory.findMany(),
    db.report.findMany(),
    db.animeRequest.findMany(),
    db.notification.findMany(),
    db.animeRelation.findMany(),
    db.recommendationSource.findMany(),
  ])

  const dump = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    counts: {
      users: users.length,
      genres: genres.length,
      studios: studios.length,
      anime: anime.length,
      animeGenres: animeGenres.length,
      animeStudios: animeStudios.length,
      characters: characters.length,
      animeCharacters: animeCharacters.length,
      episodes: episodes.length,
      subtitles: subtitles.length,
      videoServers: videoServers.length,
      schedules: schedules.length,
      announcements: announcements.length,
      news: news.length,
      siteSettings: siteSettings.length,
      ratings: ratings.length,
      reviews: reviews.length,
      comments: comments.length,
      commentLikes: commentLikes.length,
      favorites: favorites.length,
      watchlistEntries: watchlistEntries.length,
      watchHistory: watchHistory.length,
      reports: reports.length,
      requests: requests.length,
      notifications: notifications.length,
      animeRelations: animeRelations.length,
      recommendationSources: recommendationSources.length,
    },
    data: {
      users,
      genres,
      studios,
      anime,
      animeGenres,
      animeStudios,
      characters,
      animeCharacters,
      episodes,
      subtitles,
      videoServers,
      schedules,
      announcements,
      news,
      siteSettings,
      ratings,
      reviews,
      comments,
      commentLikes,
      favorites,
      watchlistEntries,
      watchHistory,
      reports,
      requests,
      notifications,
      animeRelations,
      recommendationSources,
    },
  }

  const outputPath = path.join(process.cwd(), 'prisma', 'sqlite-export.json')
  fs.writeFileSync(outputPath, JSON.stringify(dump, null, 2), 'utf-8')

  console.log('Export summary:', dump.counts)
  console.log(`Successfully exported data to ${outputPath} in ${Date.now() - startTime}ms`)
}

exportData()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Export failed:', err)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
