'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Star, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AnimeCard } from '@/types'

export interface TopTenCardProps {
  rank: number
  anime: AnimeCard
  className?: string
}

export const TopTenCard: React.FC<TopTenCardProps> = ({ rank, anime, className }) => {
  const [imgError, setImgError] = useState(false)

  return (
    <Link
      href={`/anime/${anime.slug}`}
      className={cn(
        'group flex items-center gap-3 p-2 bg-[#111114] border border-[#26262c] hover:border-[#3a3a44] rounded-[2px] transition-colors',
        className
      )}
    >
      {/* Rank number */}
      <span
        className={cn(
          'font-heading font-black text-2xl w-8 text-center shrink-0 tracking-tighter',
          rank === 1 && 'text-[#a0a0b0]',
          rank === 2 && 'text-[#8b8b94]',
          rank === 3 && 'text-[#6a6a78]',
          rank > 3 && 'text-[#3a3a44]'
        )}
      >
        {rank < 10 ? `0${rank}` : rank}
      </span>

      {/* Poster */}
      <div className="relative w-11 h-16 bg-[#17171b] rounded-[1px] overflow-hidden shrink-0 border border-[#26262c]">
        {anime.poster && !imgError ? (
          <Image
            src={anime.poster}
            alt=""
            fill
            sizes="44px"
            className="object-cover group-hover:scale-105 transition-transform"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#17171b] text-[10px] font-mono text-[#a0a0b0] font-bold p-1 text-center">
            <span>OM</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-semibold text-[#d9d9de] group-hover:text-[#a0a0b0] truncate transition-colors">
          {anime.title}
        </h4>
        <div className="flex items-center gap-2 text-[10px] font-mono text-[#56565e] mt-1">
          <span>{anime.type}</span>
          {anime.totalEpisodes && <span>• {anime.totalEpisodes} EPS</span>}
        </div>
        {anime.averageScore && (
          <div className="flex items-center gap-1 text-[10px] font-mono text-[#b8942c] font-bold mt-0.5">
            <Star size={10} className="fill-[#b8942c]" />
            {(anime.averageScore / 10).toFixed(1)}
          </div>
        )}
      </div>
    </Link>
  )
}
