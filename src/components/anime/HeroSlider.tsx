'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Play, Plus, Star, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { useSession } from 'next-auth/react'
import { useToast } from '@/components/ui/Toast'
import { useI18n } from '@/context/I18nContext'

export interface SpotlightItem {
  id: string
  title: string
  titleEnglish?: string | null
  slug: string
  synopsis?: string | null
  poster?: string | null
  banner?: string | null
  type: string
  category: string
  totalEpisodes?: number | null
  averageScore?: number | null
  genres: { genre: { name: string; slug: string } }[]
}

export interface HeroSliderProps {
  items: SpotlightItem[]
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [imgError, setImgError] = useState(false)
  const { data: session } = useSession()
  const { success, error } = useToast()
  const { t } = useI18n()

  useEffect(() => {
    setImgError(false)
  }, [currentIndex])

  useEffect(() => {
    if (items.length <= 1 || isPaused) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length)
    }, 7000)

    return () => clearInterval(interval)
  }, [items.length, isPaused])

  if (!items || items.length === 0) return null

  const current = items[currentIndex]

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length)
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)
  }

  const handleAddWatchlist = async () => {
    if (!session?.user) {
      error('Please sign in to add to your watchlist')
      return
    }

    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ animeId: current.id, status: 'PLAN_TO_WATCH' }),
      })
      if (res.ok) {
        success(`Added "${current.title}" to Watchlist`)
      }
    } catch {
      error('Failed to update watchlist')
    }
  }

  const bannerImage = current.banner || current.poster

  return (
    <div
      className="relative w-full h-[55vh] min-h-[460px] max-h-[640px] overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Banner with blur, vignette & gradients */}
      <div className="absolute inset-0 bg-[#0b0b0d]">
        {bannerImage && !imgError ? (
          <Image
            src={bannerImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center filter brightness-80 transform scale-105 transition-transform duration-1000 ease-out"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1a1a22] via-[#111114] to-[#0b0b0d]" />
        )}
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0b0d]/90 via-[#0b0b0d]/40 to-transparent" />
      </div>

      {/* Slide Content */}
      <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="max-w-2xl flex flex-col gap-3 sm:gap-4 z-10">
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-[#a0a0b0] text-[#0b0b0d] text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-[1px]">
              {t('home.spotlight')} #{currentIndex + 1}
            </span>
            <span className="bg-[#17171b]/80 border border-[#26262c] text-[10px] font-mono uppercase text-[#d9d9de] px-2 py-0.5 rounded-[1px]">
              {current.type}
            </span>
            {current.category === 'DONGHUA' && (
              <span className="bg-[#17171b]/80 border border-[#26262c] text-[10px] font-mono uppercase text-[#a0a0b0] px-2 py-0.5 rounded-[1px]">
                Donghua
              </span>
            )}
            {current.averageScore && (
              <span className="bg-[#17171b]/80 border border-[#26262c] text-[10px] font-mono text-[#b8942c] font-bold px-2 py-0.5 rounded-[1px] flex items-center gap-1">
                <Star size={11} className="fill-[#b8942c]" />
                {(current.averageScore / 10).toFixed(1)}
              </span>
            )}
            {current.totalEpisodes && (
              <span className="text-[11px] font-mono text-[#8b8b94]">
                {current.totalEpisodes} {t('common.episodes')}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#d9d9de] font-heading tracking-tight line-clamp-2 drop-shadow-md">
            {current.title}
          </h1>

          {/* Genres */}
          {current.genres && current.genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {current.genres.slice(0, 4).map((g) => (
                <Link
                  key={g.genre.slug}
                  href={`/browse?genre=${g.genre.slug}`}
                  className="text-[11px] font-mono text-[#8b8b94] hover:text-[#d9d9de] bg-[#17171b]/60 border border-[#26262c] px-2 py-0.5 rounded-[1px] transition-colors"
                >
                  {g.genre.name}
                </Link>
              ))}
            </div>
          )}

          {/* Synopsis */}
          {current.synopsis && (
            <p className="text-xs sm:text-sm text-[#8b8b94] line-clamp-3 leading-relaxed max-w-xl">
              {current.synopsis.replace(/<[^>]*>/g, '')}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Link href={`/anime/${current.slug}`}>
              <Button size="lg" variant="primary" clipCorner icon={<Play size={18} className="fill-[#0b0b0d]" />}>
                {t('home.watch_now_btn')}
              </Button>
            </Link>
            <Button
              size="lg"
              variant="secondary"
              icon={<Plus size={18} />}
              onClick={handleAddWatchlist}
            >
              {t('home.add_to_list_btn')}
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Controls: Pagination Dots + Navigation Arrows (no text overlap) */}
      <div className="absolute bottom-6 right-4 sm:right-8 z-20 flex items-center gap-4 bg-[#0b0b0d]/70 backdrop-blur-sm p-1.5 border border-[#26262c] rounded-[2px]">
        {/* Pagination Dots */}
        <div className="flex items-center gap-1.5 px-1">
          {items.map((_, index) => (
            <button
              key={`dot-${index}`}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'h-1 rounded-[1px] transition-all duration-300',
                index === currentIndex ? 'w-6 bg-[#a0a0b0]' : 'w-2 bg-[#26262c] hover:bg-[#3a3a44]'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Prev / Next Arrows */}
        <div className="flex items-center gap-1 pl-1 border-l border-[#26262c]">
          <button
            onClick={handlePrev}
            className="w-7 h-7 bg-[#17171b] hover:bg-[#202026] text-[#d9d9de] hover:text-white rounded-[1px] flex items-center justify-center transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={handleNext}
            className="w-7 h-7 bg-[#17171b] hover:bg-[#202026] text-[#d9d9de] hover:text-white rounded-[1px] flex items-center justify-center transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
