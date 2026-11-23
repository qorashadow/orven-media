import React from 'react'
import Link from 'next/link'
import { db } from '@/lib/db'
import { AnimeGrid } from '@/components/anime/AnimeGrid'
import { AnimeRow } from '@/components/anime/AnimeRow'
import { GenreTag } from '@/components/anime/GenreTag'
import { Tv, Compass } from 'lucide-react'

export const revalidate = 60

export default async function AnimeHubPage() {
  const [trendingAnime, allAnime] = await Promise.all([
    db.anime.findMany({
      where: { category: 'ANIME' },
      orderBy: { trending: 'desc' },
      take: 12,
      include: { genres: { include: { genre: true } } },
    }),
    db.anime.findMany({
      where: { category: 'ANIME' },
      orderBy: { popularity: 'desc' },
      take: 40,
      include: { genres: { include: { genre: true } } },
    }),
  ])

  const popularGenres = ['Action', 'Adventure', 'Fantasy', 'Shounen', 'Sci-Fi', 'Supernatural', 'Thriller']

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Header Banner */}
      <div className="relative p-6 sm:p-8 bg-[#111114] border border-[#26262c] rounded-[2px] overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#a0a0b0]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-[#a0a0b0] text-[#0b0b0d] font-bold rounded-[1px]">
              Japanese Animation
            </span>
            <span className="text-xs font-mono text-[#8b8b94]">{allAnime.length} Titles Available</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#d9d9de] tracking-tight">
            Anime Catalog
          </h1>
          <p className="text-sm text-[#8b8b94] leading-relaxed">
            Discover legendary anime series, current seasonal broadcasts, and fan-favorite hits in crystal clear HD with fast streaming and multi-language subtitles.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {popularGenres.map((g) => (
              <GenreTag key={g} name={g} slug={g.toLowerCase().replace(/\s+/g, '-')} />
            ))}
          </div>
        </div>
      </div>

      {/* Trending Anime Row */}
      {trendingAnime.length > 0 && (
        <AnimeRow
          title="Trending Anime"
          subtitle="Most active titles in the community"
          items={trendingAnime as any}
        />
      )}

      {/* All Anime Catalogue */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#26262c]">
          <h2 className="text-base sm:text-lg font-bold font-heading text-[#d9d9de] flex items-center gap-2">
            <Compass size={18} className="text-[#a0a0b0]" /> Popular Anime Series
          </h2>
          <Link
            href="/browse?category=ANIME"
            className="text-xs font-mono text-[#8b8b94] hover:text-[#a0a0b0] transition-colors"
          >
            Advanced filters &rarr;
          </Link>
        </div>

        <AnimeGrid items={allAnime as any} />
      </div>
    </div>
  )
}
