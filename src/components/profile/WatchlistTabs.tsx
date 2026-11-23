'use client'

import React, { useState } from 'react'
import { Tabs } from '@/components/ui/Tabs'
import { AnimeCard } from '@/components/anime/AnimeCard'
import { WATCHLIST_STATUSES } from '@/lib/constants'
import type { WatchlistItem } from '@/types'

export interface WatchlistTabsProps {
  items: WatchlistItem[]
}

export const WatchlistTabs: React.FC<WatchlistTabsProps> = ({ items }) => {
  const [activeTab, setActiveTab] = useState<string>('WATCHING')

  const tabList = WATCHLIST_STATUSES.map((status) => ({
    id: status.value,
    label: status.label,
    badge: items.filter((item) => item.status === status.value).length,
  }))

  const filteredItems = items.filter((item) => item.status === activeTab)

  return (
    <div className="flex flex-col gap-4">
      <Tabs tabs={tabList} activeTab={activeTab} onChange={setActiveTab} variant="pill" />

      {filteredItems.length === 0 ? (
        <div className="py-16 text-center text-xs font-mono text-[#56565e] bg-[#111114] border border-[#26262c] rounded-[2px]">
          No anime in this category.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {filteredItems.map((entry) => (
            <div key={entry.id} className="relative">
              <AnimeCard anime={entry.anime} />
              {entry.episodesWatched > 0 && (
                <div className="mt-1 text-[10px] font-mono text-[#8b8b94] text-center">
                  Watched: {entry.episodesWatched} eps
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
