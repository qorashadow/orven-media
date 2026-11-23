import React from 'react'
import { AnimeCard } from './AnimeCard'
import { Skeleton } from '@/components/ui/Skeleton'
import type { AnimeCard as AnimeCardType } from '@/types'
import { cn } from '@/lib/utils'

export interface AnimeGridProps {
  items: AnimeCardType[]
  loading?: boolean
  skeletonCount?: number
  className?: string
}

export const AnimeGrid: React.FC<AnimeGridProps> = ({
  items,
  loading = false,
  skeletonCount = 12,
  className,
}) => {
  if (loading) {
    return (
      <div
        className={cn(
          'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4',
          className
        )}
      >
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <div key={`skeleton-${index}`} className="flex flex-col gap-2">
            <Skeleton variant="card" className="clip-corner-tr" />
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="40%" height={10} />
          </div>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="py-16 text-center text-xs text-[#8b8b94] font-mono">
        No titles match your criteria.
      </div>
    )
  }

  return (
    <div
      className={cn(
        'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4',
        className
      )}
    >
      {items.map((anime, index) => (
        <AnimeCard key={anime.id} anime={anime} priority={index < 6} />
      ))}
    </div>
  )
}
