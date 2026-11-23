import React from 'react'
import { Tv, Clock, CheckCircle2, Heart, MessageSquare } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

export interface StatsSectionProps {
  stats: {
    episodesWatched: number
    hoursWatched: number
    completedAnime: number
    favoritesCount: number
    commentsCount: number
  }
}

export const StatsSection: React.FC<StatsSectionProps> = ({ stats }) => {
  const items = [
    {
      label: 'Episodes Watched',
      value: formatNumber(stats.episodesWatched),
      icon: <Tv size={16} className="text-[#a0a0b0]" />,
    },
    {
      label: 'Time Watched',
      value: `${stats.hoursWatched}h`,
      icon: <Clock size={16} className="text-[#a0a0b0]" />,
    },
    {
      label: 'Completed',
      value: stats.completedAnime,
      icon: <CheckCircle2 size={16} className="text-[#3c8c5c]" />,
    },
    {
      label: 'Favorites',
      value: stats.favoritesCount,
      icon: <Heart size={16} className="text-[#c43c3c]" />,
    },
    {
      label: 'Comments',
      value: stats.commentsCount,
      icon: <MessageSquare size={16} className="text-[#a0a0b0]" />,
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="p-3 bg-[#111114] border border-[#26262c] rounded-[2px] flex flex-col gap-1"
        >
          <div className="flex items-center justify-between text-[#8b8b94]">
            <span className="text-[10px] font-mono uppercase tracking-wider">{item.label}</span>
            {item.icon}
          </div>
          <span className="text-xl font-bold font-heading text-[#d9d9de]">{item.value}</span>
        </div>
      ))}
    </div>
  )
}
