import React from 'react'
import Link from 'next/link'
import { db } from '@/lib/db'
import { AnimeGrid } from '@/components/anime/AnimeGrid'
import { Film, Compass } from 'lucide-react'

export const revalidate = 60

export default async function MoviesHubPage() {
  const movies = await db.anime.findMany({
    where: { type: 'MOVIE' },
    orderBy: { averageScore: 'desc' },
    take: 40,
    include: { genres: { include: { genre: true } } },
  })

  // If no explicit MOVIE types exist, fetch high scoring titles
  const displayItems =
    movies.length > 0
      ? movies
      : await db.anime.findMany({
          orderBy: { averageScore: 'desc' },
          take: 20,
          include: { genres: { include: { genre: true } } },
        })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Header Banner */}
      <div className="relative p-6 sm:p-8 bg-[#111114] border border-[#26262c] rounded-[2px] overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#a0a0b0]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-[#a0a0b0] text-[#0b0b0d] font-bold rounded-[1px]">
              Cinema & Specials
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#d9d9de] tracking-tight">
            Animated Feature Films
          </h1>
          <p className="text-sm text-[#8b8b94] leading-relaxed">
            Theatrical releases, standalone cinematic spectacles, and feature-length animated stories from Japan and China.
          </p>
        </div>
      </div>

      {/* Movies Grid */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#26262c]">
          <h2 className="text-base sm:text-lg font-bold font-heading text-[#d9d9de] flex items-center gap-2">
            <Film size={18} className="text-[#a0a0b0]" /> Feature Films
          </h2>
          <Link
            href="/browse?type=MOVIE"
            className="text-xs font-mono text-[#8b8b94] hover:text-[#a0a0b0] transition-colors"
          >
            All movies &rarr;
          </Link>
        </div>

        <AnimeGrid items={displayItems as any} />
      </div>
    </div>
  )
}
