import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { WatchlistTabs } from '@/components/profile/WatchlistTabs'
import { StatsSection } from '@/components/profile/StatsSection'
import { HistoryList } from '@/components/profile/HistoryList'
import { AnimeCard } from '@/components/anime/AnimeCard'
import type { Metadata } from 'next'

interface ProfilePageProps {
  params: Promise<{ username: string }>
  searchParams: Promise<{ tab?: string }>
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params
  return {
    title: `${username}'s Profile | Orven Media`,
  }
}

export default async function ProfilePage({ params, searchParams }: ProfilePageProps) {
  const { username } = await params
  const { tab = 'watchlist' } = await searchParams
  const session = await auth()

  const user = await db.user.findUnique({
    where: { username },
    include: {
      watchlist: {
        include: {
          anime: {
            include: { genres: { include: { genre: true } } },
          },
        },
      },
      favorites: {
        include: {
          anime: {
            include: { genres: { include: { genre: true } } },
          },
        },
      },
      watchHistory: {
        orderBy: { watchedAt: 'desc' },
        take: 24,
        include: {
          anime: {
            include: { genres: { include: { genre: true } } },
          },
          episode: { select: { id: true, number: true, title: true } },
        },
      },
      _count: {
        select: {
          watchHistory: true,
          watchlist: true,
          favorites: true,
          comments: true,
        },
      },
    },
  })

  if (!user) notFound()

  const isOwn = session?.user?.id === user.id

  // If private and not own
  if (!user.isPublic && !isOwn) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-bold font-heading text-[#d9d9de]">This Profile is Private</h1>
        <p className="text-xs text-[#8b8b94] mt-1">
          The user has chosen to keep their profile details private.
        </p>
      </div>
    )
  }

  // Calculate statistics
  const totalEpisodesWatched = user.watchHistory.length
  const hoursWatched = Math.round(
    user.watchHistory.reduce((sum, h) => sum + h.progress, 0) / 3600
  )
  const completedAnime = user.watchlist.filter((w) => w.status === 'COMPLETED').length

  const stats = {
    episodesWatched: totalEpisodesWatched,
    hoursWatched,
    completedAnime,
    favoritesCount: user._count.favorites,
    commentsCount: user._count.comments,
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Profile Header */}
      <ProfileHeader user={user as any} isOwnProfile={isOwn} />

      {/* Stats Cards */}
      <StatsSection stats={stats} />

      {/* Tabs / Subsections */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2 border-b border-[#26262c] pb-3 text-sm font-mono">
          <Link
            href={`/profile/${username}?tab=watchlist`}
            className={`px-3 py-1.5 rounded-[1px] ${
              tab === 'watchlist' ? 'bg-[#a0a0b0] text-[#0b0b0d] font-bold' : 'text-[#8b8b94] hover:text-[#d9d9de]'
            }`}
          >
            Watchlist ({user.watchlist.length})
          </Link>
          <Link
            href={`/profile/${username}?tab=favorites`}
            className={`px-3 py-1.5 rounded-[1px] ${
              tab === 'favorites' ? 'bg-[#a0a0b0] text-[#0b0b0d] font-bold' : 'text-[#8b8b94] hover:text-[#d9d9de]'
            }`}
          >
            Favorites ({user.favorites.length})
          </Link>
          {(!user.hideHistory || isOwn) && (
            <Link
              href={`/profile/${username}?tab=history`}
              className={`px-3 py-1.5 rounded-[1px] ${
                tab === 'history' ? 'bg-[#a0a0b0] text-[#0b0b0d] font-bold' : 'text-[#8b8b94] hover:text-[#d9d9de]'
              }`}
            >
              History ({user.watchHistory.length})
            </Link>
          )}
        </div>

        {tab === 'watchlist' && <WatchlistTabs items={user.watchlist as any} />}

        {tab === 'favorites' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {user.favorites.map((fav) => (
              <AnimeCard key={fav.id} anime={fav.anime as any} />
            ))}
          </div>
        )}

        {tab === 'history' && (!user.hideHistory || isOwn) && (
          <HistoryList history={user.watchHistory as any} isOwn={isOwn} />
        )}
      </div>
    </div>
  )
}
