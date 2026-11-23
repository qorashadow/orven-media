'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Award } from 'lucide-react'
import { TopTenCard } from './TopTenCard'
import type { AnimeCard } from '@/types'
import { useI18n } from '@/context/I18nContext'

export interface TopTenSectionProps {
  todayItems: AnimeCard[]
  weekItems: AnimeCard[]
  monthItems: AnimeCard[]
}

export const TopTenSection: React.FC<TopTenSectionProps> = ({
  todayItems,
  weekItems,
  monthItems,
}) => {
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'month'>('today')
  const { t } = useI18n()

  const currentList =
    activeTab === 'today'
      ? todayItems
      : activeTab === 'week'
      ? weekItems
      : monthItems

  return (
    <div className="flex flex-col gap-3 bg-[#111114] border border-[#26262c] rounded-[2px] p-4">
      <div className="flex items-center justify-between pb-2 border-b border-[#26262c]">
        <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-[#d9d9de] flex items-center gap-1.5">
          <Award size={15} className="text-[#a0a0b0]" /> {t('home.top_10')}
        </h3>
        <Link href="/top" className="text-[11px] font-mono text-[#8b8b94] hover:text-[#a0a0b0]">
          {t('home.all_time')} &rarr;
        </Link>
      </div>

      {/* Tabs: Today / Week / Month */}
      <div className="grid grid-cols-3 gap-1 bg-[#17171b] p-0.5 rounded-[1px] border border-[#26262c]">
        <button
          onClick={() => setActiveTab('today')}
          className={`py-1 text-[11px] font-mono rounded-[1px] transition-colors ${
            activeTab === 'today'
              ? 'bg-[#a0a0b0] text-[#0b0b0d] font-bold'
              : 'text-[#8b8b94] hover:text-[#d9d9de]'
          }`}
        >
          {t('home.today')}
        </button>
        <button
          onClick={() => setActiveTab('week')}
          className={`py-1 text-[11px] font-mono rounded-[1px] transition-colors ${
            activeTab === 'week'
              ? 'bg-[#a0a0b0] text-[#0b0b0d] font-bold'
              : 'text-[#8b8b94] hover:text-[#d9d9de]'
          }`}
        >
          {t('home.week')}
        </button>
        <button
          onClick={() => setActiveTab('month')}
          className={`py-1 text-[11px] font-mono rounded-[1px] transition-colors ${
            activeTab === 'month'
              ? 'bg-[#a0a0b0] text-[#0b0b0d] font-bold'
              : 'text-[#8b8b94] hover:text-[#d9d9de]'
          }`}
        >
          {t('home.month')}
        </button>
      </div>

      {/* Top 10 items */}
      <div className="flex flex-col gap-2 mt-1">
        {currentList.slice(0, 10).map((anime, index) => (
          <TopTenCard key={`${activeTab}-${anime.id}`} rank={index + 1} anime={anime} />
        ))}
      </div>
    </div>
  )
}
