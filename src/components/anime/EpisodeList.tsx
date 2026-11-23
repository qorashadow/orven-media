'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Play, Search, LayoutGrid, List } from 'lucide-react'
import { cn, formatDuration } from '@/lib/utils'
import type { EpisodeItem } from '@/types'

export interface EpisodeListProps {
  animeSlug: string
  episodes: EpisodeItem[]
  currentEpisodeNumber?: number
  watchedEpisodeIds?: string[]
}

export const EpisodeList: React.FC<EpisodeListProps> = ({
  animeSlug,
  episodes,
  currentEpisodeNumber,
  watchedEpisodeIds = [],
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedRange, setSelectedRange] = useState<string>('all')

  const totalEpisodes = episodes.length
  const rangeSize = 50

  // Generate ranges e.g. 1-50, 51-100...
  const ranges = useMemo(() => {
    if (totalEpisodes <= rangeSize) return []
    const count = Math.ceil(totalEpisodes / rangeSize)
    const list: { label: string; start: number; end: number }[] = []
    for (let i = 0; i < count; i++) {
      const start = i * rangeSize + 1
      const end = Math.min((i + 1) * rangeSize, totalEpisodes)
      list.push({ label: `${start}-${end}`, start, end })
    }
    return list
  }, [totalEpisodes])

  const filteredEpisodes = useMemo(() => {
    return episodes.filter((ep) => {
      // Range filter
      if (selectedRange !== 'all') {
        const [start, end] = selectedRange.split('-').map(Number)
        if (ep.number < start || ep.number > end) return false
      }
      // Search filter
      if (searchTerm) {
        const query = searchTerm.toLowerCase()
        const matchesNumber = ep.number.toString().includes(query)
        const matchesTitle = ep.title ? ep.title.toLowerCase().includes(query) : false
        return matchesNumber || matchesTitle
      }
      return true
    })
  }, [episodes, selectedRange, searchTerm])

  return (
    <div className="flex flex-col gap-4">
      {/* Controls: Search, Ranges, View mode */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111114] border border-[#26262c] p-3 rounded-[2px]">
        {/* Search */}
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8b8b94]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search episode..."
            className="w-full h-8 pl-8 pr-3 bg-[#17171b] border border-[#26262c] text-xs text-[#d9d9de] rounded-[1px] focus:outline-none focus:border-[#a0a0b0]"
          />
        </div>

        {/* Range Buttons */}
        {ranges.length > 0 && (
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setSelectedRange('all')}
              className={cn(
                'px-2 py-1 text-xs font-mono rounded-[1px] transition-colors',
                selectedRange === 'all'
                  ? 'bg-[#a0a0b0] text-[#0b0b0d] font-bold'
                  : 'bg-[#17171b] text-[#8b8b94] hover:text-[#d9d9de]'
              )}
            >
              All
            </button>
            {ranges.map((r) => (
              <button
                key={r.label}
                onClick={() => setSelectedRange(r.label)}
                className={cn(
                  'px-2 py-1 text-xs font-mono rounded-[1px] transition-colors',
                  selectedRange === r.label
                    ? 'bg-[#a0a0b0] text-[#0b0b0d] font-bold'
                    : 'bg-[#17171b] text-[#8b8b94] hover:text-[#d9d9de]'
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        )}

        {/* View Toggle */}
        <div className="flex items-center gap-1 border border-[#26262c] rounded-[1px] p-0.5">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-1 rounded-[1px] transition-colors',
              viewMode === 'grid' ? 'bg-[#26262c] text-[#d9d9de]' : 'text-[#8b8b94] hover:text-[#d9d9de]'
            )}
            aria-label="Grid view"
          >
            <LayoutGrid size={14} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-1 rounded-[1px] transition-colors',
              viewMode === 'list' ? 'bg-[#26262c] text-[#d9d9de]' : 'text-[#8b8b94] hover:text-[#d9d9de]'
            )}
            aria-label="List view"
          >
            <List size={14} />
          </button>
        </div>
      </div>

      {/* Episodes rendering */}
      {filteredEpisodes.length === 0 ? (
        <div className="py-8 text-center text-xs text-[#8b8b94] font-mono">
          No episodes found matching your filter.
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredEpisodes.map((ep) => {
            const isCurrent = ep.number === currentEpisodeNumber
            const isWatched = watchedEpisodeIds.includes(ep.id)

            return (
              <Link
                key={ep.id}
                href={`/watch/${animeSlug}/${ep.number}`}
                className={cn(
                  'group flex flex-col bg-[#111114] border rounded-[2px] overflow-hidden transition-all duration-150 hover:-translate-y-0.5',
                  isCurrent
                    ? 'border-[#a0a0b0] ring-1 ring-[#a0a0b0]'
                    : 'border-[#26262c] hover:border-[#3a3a44]'
                )}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video w-full bg-[#17171b] overflow-hidden">
                  {ep.thumbnail ? (
                    <Image
                      src={ep.thumbnail}
                      alt={`Episode ${ep.number}`}
                      fill
                      sizes="(max-width: 640px) 160px, 200px"
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#56565e] font-mono text-xs">
                      EP {ep.number}
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-7 h-7 rounded-full bg-[#a0a0b0] text-[#0b0b0d] flex items-center justify-center">
                      <Play size={12} className="fill-[#0b0b0d] ml-0.5" />
                    </div>
                  </div>

                  {ep.filler && (
                    <span className="absolute top-1 left-1 bg-[#c43c3c] text-white text-[9px] font-mono px-1 rounded-[1px]">
                      Filler
                    </span>
                  )}
                  {ep.duration && (
                    <span className="absolute bottom-1 right-1 bg-black/80 text-[#d9d9de] text-[9px] font-mono px-1 rounded-[1px]">
                      {formatDuration(Math.round(ep.duration / 60))}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-2 flex flex-col">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#d9d9de]">
                    <span className="font-mono">Episode {ep.number}</span>
                    {isWatched && <span className="text-[10px] text-[#3c8c5c] font-mono">Watched</span>}
                  </div>
                  {ep.title && (
                    <span className="text-[11px] text-[#8b8b94] truncate mt-0.5" title={ep.title}>
                      {ep.title}
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {filteredEpisodes.map((ep) => {
            const isCurrent = ep.number === currentEpisodeNumber
            const isWatched = watchedEpisodeIds.includes(ep.id)

            return (
              <Link
                key={ep.id}
                href={`/watch/${animeSlug}/${ep.number}`}
                className={cn(
                  'flex items-center gap-3 p-2.5 bg-[#111114] border rounded-[2px] transition-colors',
                  isCurrent
                    ? 'border-[#a0a0b0] bg-[#17171b]'
                    : 'border-[#26262c] hover:border-[#3a3a44] hover:bg-[#17171b]'
                )}
              >
                <div className="w-8 h-8 rounded-[1px] bg-[#17171b] border border-[#26262c] flex items-center justify-center font-mono font-bold text-xs text-[#a0a0b0] shrink-0">
                  {ep.number}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-[#d9d9de] truncate">
                    {ep.title || `Episode ${ep.number}`}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-[#56565e] mt-0.5">
                    {ep.duration && <span>{formatDuration(Math.round(ep.duration / 60))}</span>}
                    {ep.filler && <span className="text-[#c43c3c]">Filler</span>}
                  </div>
                </div>
                {isWatched && <span className="text-[10px] text-[#3c8c5c] font-mono shrink-0">Watched</span>}
                <Play size={14} className="text-[#8b8b94] group-hover:text-[#d9d9de] shrink-0" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
