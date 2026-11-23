'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Play, Star, Plus, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AnimeCard as AnimeCardType } from '@/types'
import { useSession } from 'next-auth/react'
import { useToast } from '@/components/ui/Toast'

export interface AnimeCardProps {
  anime: AnimeCardType
  size?: 'sm' | 'md' | 'lg'
  priority?: boolean
  className?: string
}

export const AnimeCard: React.FC<AnimeCardProps> = ({
  anime,
  size = 'md',
  priority = false,
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [inWatchlist, setInWatchlist] = useState(false)
  const [loadingWatchlist, setLoadingWatchlist] = useState(false)
  const { data: session } = useSession()
  const { success, error } = useToast()

  const sizes = {
    sm: 'w-[140px] sm:w-[150px]',
    md: 'w-full',
    lg: 'w-[200px] sm:w-[220px]',
  }

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!session?.user) {
      error('Please sign in to add to your watchlist')
      return
    }

    setLoadingWatchlist(true)
    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ animeId: anime.id, status: 'PLAN_TO_WATCH' }),
      })
      if (res.ok) {
        setInWatchlist(true)
        success(`Added "${anime.title}" to Watchlist`)
      }
    } catch {
      error('Failed to update watchlist')
    } finally {
      setLoadingWatchlist(false)
    }
  }

  return (
    <div
      className={cn(
        'group relative flex flex-col shrink-0 select-none transition-all duration-200',
        sizes[size],
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/anime/${anime.slug}`} className="block relative w-full">
        {/* Poster Wrapper */}
        <div className="relative aspect-[2/3] w-full bg-[#17171b] border border-[#26262c] group-hover:border-[#a0a0b0]/50 rounded-[2px] overflow-hidden clip-corner-tr transition-all duration-200 group-hover:-translate-y-1">
          {anime.poster && !imgError ? (
            <Image
              src={anime.poster}
              alt=""
              fill
              sizes="(max-width: 640px) 150px, (max-width: 1024px) 200px, 240px"
              priority={priority}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-[#17171b] select-none">
              <div className="w-8 h-8 rounded-[1px] bg-[#26262c] border border-[#3a3a44] flex items-center justify-center text-[#a0a0b0] font-mono text-xs font-bold mb-2">
                OM
              </div>
              <span className="font-heading font-medium text-xs text-[#d9d9de] line-clamp-3 leading-tight px-1">
                {anime.title}
              </span>
            </div>
          )}

          {/* Vignette Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0d] via-[#0b0b0d]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-2.5">
            {/* Quick Watch Icon */}
            <div className="w-9 h-9 rounded-full bg-[#a0a0b0] text-[#0b0b0d] flex items-center justify-center self-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-200">
              <Play size={16} className="fill-[#0b0b0d] ml-0.5" />
            </div>

            {/* Quick Add button */}
            <button
              onClick={handleQuickAdd}
              disabled={loadingWatchlist}
              className="mt-3 w-full py-1 bg-[#17171b]/90 hover:bg-[#202026] border border-[#26262c] text-[#d9d9de] text-[10px] font-mono uppercase tracking-wider rounded-[1px] flex items-center justify-center gap-1 transition-colors"
            >
              {inWatchlist ? <Check size={12} className="text-[#3c8c5c]" /> : <Plus size={12} />}
              <span>{inWatchlist ? 'In List' : 'Add to List'}</span>
            </button>
          </div>

          {/* Badges on poster */}
          <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 pointer-events-none">
            <span className="bg-[#0b0b0d]/80 backdrop-blur-sm border border-[#26262c] text-[9px] font-mono uppercase font-semibold text-[#a0a0b0] px-1 py-0.5 rounded-[1px]">
              {anime.type}
            </span>
          </div>

          {anime.averageScore && (
            <div className="absolute top-1.5 right-1.5 pointer-events-none">
              <span className="bg-[#0b0b0d]/80 backdrop-blur-sm border border-[#26262c] text-[10px] font-mono font-bold text-[#b8942c] px-1.5 py-0.5 rounded-[1px] flex items-center gap-0.5">
                <Star size={10} className="fill-[#b8942c]" />
                {(anime.averageScore / 10).toFixed(1)}
              </span>
            </div>
          )}

          {anime.totalEpisodes && (
            <div className="absolute bottom-1.5 left-1.5 pointer-events-none">
              <span className="bg-[#0b0b0d]/85 border border-[#26262c] text-[9px] font-mono text-[#8b8b94] px-1 py-0.2 rounded-[1px]">
                EP {anime.totalEpisodes}
              </span>
            </div>
          )}
        </div>

        {/* Title and metadata */}
        <div className="mt-2 flex flex-col">
          <h3
            className="text-xs font-semibold text-[#d9d9de] group-hover:text-[#a0a0b0] transition-colors line-clamp-1 leading-snug font-heading"
            title={anime.title}
          >
            {anime.title}
          </h3>

          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#56565e] mt-0.5">
            {anime.year && <span>{anime.year}</span>}
            {anime.category === 'DONGHUA' && (
              <>
                <span>•</span>
                <span className="text-[#a0a0b0]/80">Donghua</span>
              </>
            )}
            {anime.genres && anime.genres.length > 0 && (
              <>
                <span>•</span>
                <span className="truncate">{anime.genres[0].genre.name}</span>
              </>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}
