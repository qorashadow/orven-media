'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Play, Trash2 } from 'lucide-react'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { formatTimeAgo, formatTimestamp, cn } from '@/lib/utils'
import type { WatchHistoryItem } from '@/types'

export interface HistoryListProps {
  history: WatchHistoryItem[]
  onClear?: () => void
  isOwn?: boolean
}

export const HistoryList: React.FC<HistoryListProps> = ({ history, onClear, isOwn = false }) => {
  if (history.length === 0) {
    return (
      <div className="py-16 text-center text-xs font-mono text-[#56565e] bg-[#111114] border border-[#26262c] rounded-[2px]">
        No watch history found.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {isOwn && onClear && (
        <div className="flex justify-end">
          <button
            onClick={onClear}
            className="text-xs font-mono text-[#c43c3c] hover:underline flex items-center gap-1"
          >
            <Trash2 size={13} /> Clear Watch History
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {history.map((item) => {
          const progressPercent =
            item.duration > 0 ? (item.progress / item.duration) * 100 : 0

          return (
            <Link
              key={item.id}
              href={`/watch/${item.anime.slug}/${item.episode.number}`}
              className="group flex flex-col bg-[#111114] border border-[#26262c] hover:border-[#a0a0b0]/50 rounded-[2px] overflow-hidden transition-colors"
            >
              {/* Poster thumbnail */}
              <div className="relative aspect-video w-full bg-[#17171b] overflow-hidden">
                {item.anime.poster && (
                  <Image
                    src={item.anime.poster}
                    alt={item.anime.title}
                    fill
                    sizes="200px"
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <div className="w-8 h-8 rounded-full bg-[#a0a0b0] text-[#0b0b0d] flex items-center justify-center">
                    <Play size={14} className="fill-[#0b0b0d] ml-0.5" />
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0">
                  <ProgressBar value={progressPercent} size="xs" variant="accent" />
                </div>
              </div>

              {/* Info */}
              <div className="p-2.5 flex flex-col">
                <h4 className="text-xs font-semibold text-[#d9d9de] group-hover:text-[#a0a0b0] truncate font-heading transition-colors">
                  {item.anime.title}
                </h4>
                <div className="flex items-center justify-between text-[10px] font-mono text-[#8b8b94] mt-1">
                  <span>EP {item.episode.number}</span>
                  <span>{formatTimeAgo(item.watchedAt)}</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
