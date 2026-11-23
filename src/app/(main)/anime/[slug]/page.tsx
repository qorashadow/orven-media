import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { Play, Star, Calendar, Clock, Film, Tv, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { GenreTag } from '@/components/anime/GenreTag'
import { EpisodeList } from '@/components/anime/EpisodeList'
import { CharacterCard } from '@/components/anime/CharacterCard'
import { RelatedAnime } from '@/components/anime/RelatedAnime'
import { WatchlistButton } from '@/components/social/WatchlistButton'
import { FavoriteButton } from '@/components/social/FavoriteButton'
import { ShareButton } from '@/components/social/ShareButton'
import { RatingWidget } from '@/components/social/RatingWidget'
import { CommentSection } from '@/components/comments/CommentSection'
import { AnimeRow } from '@/components/anime/AnimeRow'
import { formatDuration } from '@/lib/utils'
import type { Metadata } from 'next'

interface AnimeDetailPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: AnimeDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const anime = await db.anime.findUnique({
    where: { slug },
    select: { title: true, synopsis: true, poster: true },
  })

  if (!anime) return { title: 'Anime Not Found | Orven Media' }

  return {
    title: `${anime.title} - Watch Online Free`,
    description: anime.synopsis?.substring(0, 160) || `Watch ${anime.title} in HD on Orven Media`,
    openGraph: {
      title: anime.title,
      description: anime.synopsis?.substring(0, 160) || '',
      images: anime.poster ? [anime.poster] : [],
    },
  }
}

export default async function AnimeDetailPage({ params }: AnimeDetailPageProps) {
  const { slug } = await params
  const session = await auth()
  const userId = session?.user?.id

  const anime = await db.anime.findUnique({
    where: { slug },
    include: {
      genres: { include: { genre: true } },
      studios: { include: { studio: true } },
      episodes: {
        orderBy: { number: 'asc' },
        include: { subtitles: true, servers: true },
      },
      characters: {
        include: { character: true },
        take: 12,
      },
      relations: {
        include: {
          target: {
            include: { genres: { include: { genre: true } } },
          },
        },
      },
      _count: {
        select: { ratings: true, favoritedBy: true },
      },
    },
  })

  if (!anime) notFound()

  // User interactions if logged in
  let userWatchlistStatus: string | null = null
  let userIsFavorited = false
  let userScore: number | null = null
  let watchedEpisodeIds: string[] = []

  if (userId) {
    const [watchlistEntry, favorite, rating, watchHistory] = await Promise.all([
      db.watchlistEntry.findUnique({
        where: { userId_animeId: { userId, animeId: anime.id } },
      }),
      db.favorite.findUnique({
        where: { userId_animeId: { userId, animeId: anime.id } },
      }),
      db.rating.findUnique({
        where: { userId_animeId: { userId, animeId: anime.id } },
      }),
      db.watchHistory.findMany({
        where: { userId, animeId: anime.id },
        select: { episodeId: true },
      }),
    ])

    userWatchlistStatus = watchlistEntry?.status || null
    userIsFavorited = !!favorite
    userScore = rating?.score || null
    watchedEpisodeIds = watchHistory.map((h) => h.episodeId)
  }

  // Recommendations (anime sharing same genres)
  const genreIds = anime.genres.map((g) => g.genreId)
  const recommendations = await db.anime.findMany({
    where: {
      id: { not: anime.id },
      genres: { some: { genreId: { in: genreIds } } },
    },
    take: 10,
    include: { genres: { include: { genre: true } } },
  })

  // Watch URL defaults to Ep 1 or first episode
  const firstEpisodeNumber = anime.episodes[0]?.number || 1
  const watchUrl = `/watch/${anime.slug}/${firstEpisodeNumber}`

  // YouTube trailer ID extraction
  const getYouTubeId = (url: string | null) => {
    if (!url) return null
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/)
    return match ? match[1] : null
  }
  const ytTrailerId = getYouTubeId(anime.trailer)

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Banner & Top Header */}
      <div className="relative w-full h-[40vh] min-h-[300px] max-h-[460px] bg-[#111114] overflow-hidden">
        {anime.banner ? (
          <Image
            src={anime.banner}
            alt={anime.title}
            fill
            priority
            sizes="100vw"
            className="object-cover filter brightness-40"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-[#17171b] via-[#202026] to-[#17171b]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0d] via-[#0b0b0d]/60 to-transparent" />
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-32 sm:-mt-40 relative z-10 flex flex-col md:flex-row gap-8">
        {/* Left Column: Poster & Quick Info */}
        <div className="w-full md:w-64 lg:w-72 shrink-0 flex flex-col gap-4">
          {/* Poster */}
          <div className="relative aspect-[2/3] w-full bg-[#17171b] border border-[#26262c] rounded-[2px] overflow-hidden clip-corner-tr shadow-2xl">
            {anime.poster ? (
              <Image
                src={anime.poster}
                alt={anime.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 300px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-mono text-xs text-[#56565e]">
                No Poster
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <Link href={watchUrl} className="w-full">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                clipCorner
                icon={<Play size={18} className="fill-[#0b0b0d]" />}
              >
                Watch Now (EP 1)
              </Button>
            </Link>

            <div className="grid grid-cols-2 gap-2">
              <WatchlistButton animeId={anime.id} currentStatus={userWatchlistStatus} />
              <FavoriteButton animeId={anime.id} initialFavorited={userIsFavorited} />
            </div>

            <ShareButton title={anime.title} />
          </div>

          {/* Rating Widget */}
          <RatingWidget
            animeId={anime.id}
            averageScore={anime.averageScore}
            userScore={userScore}
            ratingsCount={anime._count.ratings}
          />

          {/* Metadata Sidebar details */}
          <div className="p-4 bg-[#111114] border border-[#26262c] rounded-[2px] flex flex-col gap-2.5 text-xs">
            <span className="font-mono uppercase tracking-wider text-[10px] text-[#8b8b94] font-bold pb-1 border-b border-[#26262c]">
              Information
            </span>

            <div className="flex justify-between py-1 border-b border-[#17171b]">
              <span className="text-[#8b8b94]">Format</span>
              <span className="font-mono text-[#d9d9de] font-semibold">{anime.type}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-[#17171b]">
              <span className="text-[#8b8b94]">Episodes</span>
              <span className="font-mono text-[#d9d9de]">
                {anime.episodes.length} / {anime.totalEpisodes || '?'}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-[#17171b]">
              <span className="text-[#8b8b94]">Status</span>
              <span className="font-mono text-[#d9d9de]">{anime.status}</span>
            </div>

            {anime.year && (
              <div className="flex justify-between py-1 border-b border-[#17171b]">
                <span className="text-[#8b8b94]">Season</span>
                <span className="font-mono text-[#d9d9de]">
                  {anime.season} {anime.year}
                </span>
              </div>
            )}

            {anime.studios.length > 0 && (
              <div className="flex justify-between py-1 border-b border-[#17171b]">
                <span className="text-[#8b8b94]">Studio</span>
                <span className="font-mono text-[#a0a0b0]">
                  {anime.studios[0].studio.name}
                </span>
              </div>
            )}

            {anime.duration && (
              <div className="flex justify-between py-1 border-b border-[#17171b]">
                <span className="text-[#8b8b94]">Duration</span>
                <span className="font-mono text-[#d9d9de]">{anime.duration}m</span>
              </div>
            )}

            {anime.ageRating && (
              <div className="flex justify-between py-1">
                <span className="text-[#8b8b94]">Rating</span>
                <span className="font-mono text-[#d9d9de]">{anime.ageRating}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Titles, Synopsis, Episodes, Characters, Comments */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          {/* Header Info */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#a0a0b0]/20 text-[#a0a0b0] border border-[#a0a0b0]/40 text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-[1px]">
                {anime.category}
              </span>
              <span className="bg-[#17171b] border border-[#26262c] text-[10px] font-mono uppercase text-[#d9d9de] px-2 py-0.5 rounded-[1px]">
                {anime.type}
              </span>
              {anime.averageScore && (
                <span className="text-xs font-mono font-bold text-[#b8942c] flex items-center gap-1">
                  <Star size={13} className="fill-[#b8942c]" />
                  {(anime.averageScore / 10).toFixed(1)}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#d9d9de] font-heading tracking-tight">
              {anime.title}
            </h1>

            {/* Alternate titles */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-mono text-[#8b8b94]">
              {anime.titleEnglish && anime.titleEnglish !== anime.title && (
                <span>English: {anime.titleEnglish}</span>
              )}
              {anime.titleRomaji && anime.titleRomaji !== anime.title && (
                <span>Romaji: {anime.titleRomaji}</span>
              )}
              {anime.titleNative && <span>Native: {anime.titleNative}</span>}
            </div>

            {/* Genre Pills */}
            {anime.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {anime.genres.map((g) => (
                  <GenreTag key={g.genre.slug} name={g.genre.name} slug={g.genre.slug} />
                ))}
              </div>
            )}
          </div>

          {/* Synopsis */}
          {anime.synopsis && (
            <div className="p-4 bg-[#111114] border border-[#26262c] rounded-[2px] flex flex-col gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-[#d9d9de] flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-[#a0a0b0] rounded-[1px] inline-block" />
                Synopsis
              </h3>
              <p className="text-xs sm:text-sm text-[#8b8b94] leading-relaxed whitespace-pre-line">
                {anime.synopsis}
              </p>
            </div>
          )}

          {/* Trailer Embed */}
          {ytTrailerId && (
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-[#d9d9de] flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-[#a0a0b0] rounded-[1px] inline-block" />
                Trailer
              </h3>
              <div className="relative aspect-video w-full rounded-[2px] overflow-hidden border border-[#26262c] bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${ytTrailerId}`}
                  title={`${anime.title} Trailer`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          )}

          {/* Episodes List */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-[#d9d9de] flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-[#a0a0b0] rounded-[1px] inline-block" />
              Episodes ({anime.episodes.length})
            </h3>
            <EpisodeList
              animeSlug={anime.slug}
              episodes={anime.episodes as any}
              watchedEpisodeIds={watchedEpisodeIds}
            />
          </div>

          {/* Characters Section */}
          {anime.characters.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-[#d9d9de] flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-[#a0a0b0] rounded-[1px] inline-block" />
                Characters
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {anime.characters.map((ac) => (
                  <CharacterCard
                    key={ac.characterId}
                    character={ac.character}
                    role={ac.role}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Related Media */}
          {anime.relations.length > 0 && (
            <RelatedAnime relations={anime.relations as any} />
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <AnimeRow
              title="You Might Also Like"
              items={recommendations as any}
            />
          )}

          {/* Comment Section */}
          <CommentSection animeId={anime.id} />
        </div>
      </div>
    </div>
  )
}
