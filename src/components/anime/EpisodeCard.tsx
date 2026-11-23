'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EpisodeItem } from '@/types'

export interface EpisodeCardProps {
  animeSlug: string
  episode: EpisodeItem
  isCurrent?: boolean
  className?: string
}

export const EpisodeCard: React.FC<EpisodeCardProps> = ({
  animeSlug,
  episode,
  isCurrent = false,
  className,
}) => {
  const [imgError, setImgError] = useState(false)

  return (
    <Link
      href={`/watch/${animeSlug}/${episode.number}`}
      className={cn(
        'group flex items-center gap-3 p-2 bg-[#111114] border rounded-[2px] transition-all duration-150',
        isCurrent
          ? 'border-[#a0a0b0] bg-[#17171b]'
          : 'border-[#26262c] hover:border-[#3a3a44] hover:bg-[#17171b]',
        className
      )}
    >
      <div className="relative w-16 aspect-video bg-[#17171b] rounded-[1px] overflow-hidden shrink-0 border border-[#26262c]">
        {episode.thumbnail && !imgError ? (
          <Image
            src={episode.thumbnail}
            alt=""
            fill
            sizes="64px"
            className="object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-mono text-[10px] text-[#8b8b94] font-bold bg-[#17171b]">
            EP {episode.number}
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <Play size={10} className="fill-white text-white" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-[#d9d9de] flex items-center gap-1.5">
          <span className="font-mono">EP {episode.number}</span>
          {isCurrent && (
            <span className="text-[9px] font-mono text-[#a0a0b0] bg-[#a0a0b0]/10 px-1 rounded-[1px]">
              Now Playing
            </span>
          )}
        </div>
        <div className="text-[11px] text-[#8b8b94] truncate mt-0.5">
          {episode.title || `Episode ${episode.number}`}
        </div>
      </div>
    </Link>
  )
}
