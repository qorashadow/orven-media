'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { AnimeCard } from './AnimeCard'
import { Skeleton } from '@/components/ui/Skeleton'
import type { AnimeCard as AnimeCardType } from '@/types'
import { cn } from '@/lib/utils'
import { useI18n } from '@/context/I18nContext'

export interface AnimeRowProps {
  title: string
  subtitle?: string
  viewAllHref?: string
  items: AnimeCardType[]
  loading?: boolean
  className?: string
}

export const AnimeRow: React.FC<AnimeRowProps> = ({
  title,
  subtitle,
  viewAllHref,
  items,
  loading = false,
  className,
}) => {
  const rowRef = useRef<HTMLDivElement>(null)
  const { t } = useI18n()

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const scrollAmount = rowRef.current.clientWidth * 0.75
      rowRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  return (
    <section className={cn('flex flex-col gap-3 py-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#d9d9de] font-heading flex items-center gap-2">
            <span className="w-1.5 h-4 bg-[#a0a0b0] rounded-[1px] inline-block" />
            {title}
          </h2>
          {subtitle && <p className="text-xs text-[#8b8b94] mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2">
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="text-xs font-mono text-[#8b8b94] hover:text-[#a0a0b0] flex items-center gap-1 transition-colors mr-1"
            >
              <span>{t('common.view_all')}</span>
              <ArrowRight size={13} />
            </Link>
          )}

          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => scroll('left')}
              className="w-7 h-7 bg-[#111114] border border-[#26262c] hover:border-[#3a3a44] text-[#8b8b94] hover:text-[#d9d9de] rounded-[1px] flex items-center justify-center transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-7 h-7 bg-[#111114] border border-[#26262c] hover:border-[#3a3a44] text-[#8b8b94] hover:text-[#d9d9de] rounded-[1px] flex items-center justify-center transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Row content */}
      <div
        ref={rowRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-none pb-2 pt-1 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 scroll-smooth"
      >
        {loading
          ? Array.from({ length: 7 }).map((_, index) => (
              <div key={`skel-${index}`} className="w-[140px] sm:w-[170px] shrink-0 flex flex-col gap-2">
                <Skeleton variant="card" className="clip-corner-tr" />
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="40%" height={10} />
              </div>
            ))
          : items.map((anime) => (
              <AnimeCard
                key={anime.id}
                anime={anime}
                size="sm"
                className="w-[140px] sm:w-[170px]"
              />
            ))}
      </div>
    </section>
  )
}
