'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Play } from 'lucide-react'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { cn } from '@/lib/utils'

export interface ContinueWatchingProps {
  anime: {
    title: string
    slug: string
    poster: string | null
  }
  episode: {
    number: number
    title: string | null
  }
  progress: number // seconds
  duration: number // seconds
  className?: string
}

export const ContinueWatchingCard: React.FC<ContinueWatchingProps> = ({
  anime,
  episode,
  progress,
  duration,
  className,
}) => {
  const [imgError, setImgError] = useState(false)
  const percentage = duration > 0 ? (progress / duration) * 100 : 0

  return (
    <Link
      href={`/watch/${anime.slug}/${episode.number}`}
      className={cn(
        'group flex flex-col bg-[#111114] border border-[#26262c] hover:border-[#a0a0b0]/50 rounded-[2px] overflow-hidden w-[180px] sm:w-[200px] shrink-0 transition-all duration-150 hover:-translate-y-0.5',
        className
      )}
    >
      <div className="relative aspect-video w-full bg-[#17171b] overflow-hidden">
        {anime.poster && !imgError ? (
          <Image
            src={anime.poster}
            alt=""
            fill
            sizes="200px"
            className="object-cover group-hover:scale-105 transition-transform"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#17171b] text-center p-2">
            <span className="font-mono text-xs font-bold text-[#a0a0b0]">OM</span>
            <span className="text-[10px] text-[#8b8b94] truncate max-w-full">{anime.title}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-[#a0a0b0] text-[#0b0b0d] flex items-center justify-center">
            <Play size={14} className="fill-[#0b0b0d] ml-0.5" />
          </div>
        </div>

        {/* Progress Bar overlay */}
        <div className="absolute bottom-0 left-0 right-0">
          <ProgressBar value={percentage} size="xs" variant="accent" />
        </div>
      </div>

      <div className="p-2.5 flex flex-col">
        <h4 className="text-xs font-semibold text-[#d9d9de] truncate font-heading group-hover:text-[#a0a0b0] transition-colors">
          {anime.title}
        </h4>
        <span className="text-[10px] font-mono text-[#8b8b94] mt-0.5">
          EP {episode.number} {episode.title ? `• ${episode.title}` : ''}
        </span>
      </div>
    </Link>
  )
}
