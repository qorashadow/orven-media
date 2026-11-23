import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { VideoPlayer } from '@/components/player/VideoPlayer'
import { EpisodeSidebar } from '@/components/player/EpisodeSidebar'
import { CommentSection } from '@/components/comments/CommentSection'
import { ChevronLeft, ChevronRight, Tv, Share2, Info } from 'lucide-react'
import type { Metadata } from 'next'

interface WatchPageProps {
  params: Promise<{
    slug: string
    episode: string
  }>
}

export async function generateMetadata({ params }: WatchPageProps): Promise<Metadata> {
  const { slug, episode } = await params
  const epNum = parseInt(episode)

  const anime = await db.anime.findUnique({
    where: { slug },
    select: { title: true, poster: true },
  })

  if (!anime) return { title: 'Watch Video | Orven Media' }

  return {
    title: `Watch ${anime.title} Episode ${epNum} HD | Orven Media`,
    description: `Stream ${anime.title} Episode ${epNum} online with English & multi-language subtitles on Orven Media.`,
    openGraph: {
      title: `${anime.title} Episode ${epNum}`,
      images: anime.poster ? [anime.poster] : [],
    },
  }
}

export default async function WatchPage({ params }: WatchPageProps) {
  const { slug, episode } = await params
  const epNumber = parseInt(episode)
  const session = await auth()
  const userId = session?.user?.id

  // Fetch anime with episodes, subtitles and servers
  const anime = await db.anime.findUnique({
    where: { slug },
    include: {
      episodes: {
        orderBy: { number: 'asc' },
        include: {
          subtitles: true,
          servers: true,
        },
      },
      genres: { include: { genre: true } },
    },
  })

  if (!anime) notFound()

  // Find target episode
  const currentEpisode = anime.episodes.find((ep) => ep.number === epNumber)
  if (!currentEpisode) notFound()

  // Adjacent episodes
  const currentIndex = anime.episodes.findIndex((ep) => ep.number === epNumber)
  const prevEpisode = currentIndex > 0 ? anime.episodes[currentIndex - 1] : null
  const nextEpisode = currentIndex < anime.episodes.length - 1 ? anime.episodes[currentIndex + 1] : null

  // Fetch saved watch progress if user is logged in
  let savedTime = 0
  if (userId) {
    const history = await db.watchHistory.findUnique({
      where: {
        userId_episodeId: {
          userId,
          episodeId: currentEpisode.id,
        },
      },
      select: { progress: true },
    })
    savedTime = history?.progress || 0
  }

  // Format subtitles for player
  const subtitleTracks = currentEpisode.subtitles.map((sub) => ({
    id: sub.id,
    label: sub.label,
    language: sub.language,
    url: sub.url,
    isDefault: sub.isDefault,
  }))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-mono text-[#8b8b94]">
        <Link href="/" className="hover:text-[#d9d9de]">Home</Link>
        <span>/</span>
        <Link href="/browse" className="hover:text-[#d9d9de]">Anime</Link>
        <span>/</span>
        <Link href={`/anime/${anime.slug}`} className="hover:text-[#d9d9de] truncate max-w-xs">
          {anime.title}
        </Link>
        <span>/</span>
        <span className="text-[#a0a0b0]">Episode {epNumber}</span>
      </div>

      {/* Main Player Row: Player + Episode Sidebar */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Player + Episode Info */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {/* Custom Video Player */}
          <div className="border border-[#26262c] rounded-[2px] overflow-hidden bg-black shadow-2xl">
            <VideoPlayer
              animeId={anime.id}
              episodeId={currentEpisode.id}
              animeSlug={anime.slug}
              videoUrl={currentEpisode.videoUrl}
              videoType={(currentEpisode.videoType as any) || 'mp4'}
              initialTime={savedTime}
              subtitles={subtitleTracks}
              introStart={currentEpisode.introStart}
              introEnd={currentEpisode.introEnd}
              outroStart={currentEpisode.outroStart}
              hasNextEpisode={!!nextEpisode}
              hasPrevEpisode={!!prevEpisode}
              episodeNumber={epNumber}
              animeTitle={anime.title}
            />
          </div>

          {/* Episode Controls & Title */}
          <div className="p-4 bg-[#111114] border border-[#26262c] rounded-[2px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[#a0a0b0] bg-[#a0a0b0]/15 border border-[#a0a0b0]/30 px-1.5 py-0.5 rounded-[1px]">
                  EPISODE {epNumber}
                </span>
                <span className="text-xs font-mono text-[#8b8b94]">{anime.type}</span>
              </div>
              <h1 className="text-base sm:text-lg font-bold font-heading text-[#d9d9de] mt-1">
                {currentEpisode.title || `${anime.title} Episode ${epNumber}`}
              </h1>
            </div>

            {/* Prev / Next Buttons */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              {prevEpisode ? (
                <Link
                  href={`/watch/${anime.slug}/${prevEpisode.number}`}
                  className="px-3 py-1.5 bg-[#17171b] border border-[#26262c] hover:border-[#3a3a44] text-xs font-mono text-[#d9d9de] rounded-[1px] flex items-center gap-1 transition-colors"
                >
                  <ChevronLeft size={14} /> Prev
                </Link>
              ) : (
                <button
                  disabled
                  className="px-3 py-1.5 bg-[#111114] border border-[#26262c] text-xs font-mono text-[#56565e] rounded-[1px] flex items-center gap-1 opacity-50 cursor-not-allowed"
                >
                  <ChevronLeft size={14} /> Prev
                </button>
              )}

              {nextEpisode ? (
                <Link
                  href={`/watch/${anime.slug}/${nextEpisode.number}`}
                  className="px-3 py-1.5 bg-[#a0a0b0] hover:bg-[#b8b8c8] text-[#0b0b0d] text-xs font-mono font-bold rounded-[1px] flex items-center gap-1 transition-colors"
                >
                  Next <ChevronRight size={14} />
                </Link>
              ) : (
                <button
                  disabled
                  className="px-3 py-1.5 bg-[#17171b] border border-[#26262c] text-xs font-mono text-[#56565e] rounded-[1px] flex items-center gap-1 opacity-50 cursor-not-allowed"
                >
                  Next <ChevronRight size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Episode Comments */}
          <CommentSection episodeId={currentEpisode.id} />
        </div>

        {/* Right: Sidebar with episode list & servers */}
        <aside className="shrink-0">
          <EpisodeSidebar
            animeSlug={anime.slug}
            episodes={anime.episodes as any}
            currentEpisodeNumber={epNumber}
            servers={currentEpisode.servers as any}
          />
        </aside>
      </div>
    </div>
  )
}
