'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Filter, X, Check, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { GENRES, ANIME_TYPES, STATUSES, SEASONS, SORT_OPTIONS } from '@/lib/constants'
import { cn } from '@/lib/utils'

export interface FilterPanelProps {
  className?: string
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ className }) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentType = searchParams.get('type') || ''
  const currentCategory = searchParams.get('category') || ''
  const currentGenre = searchParams.get('genre')?.split(',').filter(Boolean) || []
  const currentStatus = searchParams.get('status') || ''
  const currentSeason = searchParams.get('season') || ''
  const currentSort = searchParams.get('sort') || 'popular'
  const currentYear = searchParams.get('year') || ''

  const [selectedType, setSelectedType] = useState<string>(currentType)
  const [selectedCategory, setSelectedCategory] = useState<string>(currentCategory)
  const [selectedGenres, setSelectedGenres] = useState<string[]>(currentGenre)
  const [selectedStatus, setSelectedStatus] = useState<string>(currentStatus)
  const [selectedSeason, setSelectedSeason] = useState<string>(currentSeason)
  const [selectedSort, setSelectedSort] = useState<string>(currentSort)
  const [selectedYear, setSelectedYear] = useState<string>(currentYear)

  const toggleGenre = (genreSlug: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genreSlug) ? prev.filter((g) => g !== genreSlug) : [...prev, genreSlug]
    )
  }

  const handleApply = () => {
    const params = new URLSearchParams()
    if (selectedType) params.set('type', selectedType)
    if (selectedCategory) params.set('category', selectedCategory)
    if (selectedGenres.length > 0) params.set('genre', selectedGenres.join(','))
    if (selectedStatus) params.set('status', selectedStatus)
    if (selectedSeason) params.set('season', selectedSeason)
    if (selectedSort && selectedSort !== 'popular') params.set('sort', selectedSort)
    if (selectedYear) params.set('year', selectedYear)

    router.push(`/browse?${params.toString()}`)
  }

  const handleReset = () => {
    setSelectedType('')
    setSelectedCategory('')
    setSelectedGenres([])
    setSelectedStatus('')
    setSelectedSeason('')
    setSelectedSort('popular')
    setSelectedYear('')
    router.push('/browse')
  }

  return (
    <div className={cn('bg-[#111114] border border-[#26262c] rounded-[2px] p-4 flex flex-col gap-5', className)}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#26262c]">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-[#a0a0b0]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#d9d9de] font-mono">
            Filters
          </h3>
        </div>
        <button
          onClick={handleReset}
          className="text-[11px] font-mono text-[#8b8b94] hover:text-[#d9d9de] flex items-center gap-1 transition-colors"
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      {/* Category Toggle (All / Anime / Donghua) */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#8b8b94]">
          Category
        </span>
        <div className="grid grid-cols-3 gap-1 bg-[#17171b] p-1 border border-[#26262c] rounded-[1px]">
          {[
            { value: '', label: 'All' },
            { value: 'ANIME', label: 'Anime' },
            { value: 'DONGHUA', label: 'Donghua' },
          ].map((cat) => (
            <button
              key={cat.label}
              type="button"
              onClick={() => setSelectedCategory(cat.value)}
              className={cn(
                'py-1 text-xs font-mono rounded-[1px] transition-colors',
                selectedCategory === cat.value
                  ? 'bg-[#a0a0b0] text-[#0b0b0d] font-bold'
                  : 'text-[#8b8b94] hover:text-[#d9d9de]'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Format / Type */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#8b8b94]">
          Format
        </span>
        <div className="flex flex-wrap gap-1.5">
          {ANIME_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setSelectedType(selectedType === t ? '' : t)}
              className={cn(
                'px-2.5 py-1 text-xs font-mono rounded-[1px] border transition-colors',
                selectedType === t
                  ? 'bg-[#a0a0b0]/20 border-[#a0a0b0] text-[#a0a0b0] font-bold'
                  : 'bg-[#17171b] border-[#26262c] text-[#8b8b94] hover:text-[#d9d9de]'
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#8b8b94]">
          Status
        </span>
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSelectedStatus(selectedStatus === s ? '' : s)}
              className={cn(
                'px-2.5 py-1 text-xs font-mono rounded-[1px] border transition-colors',
                selectedStatus === s
                  ? 'bg-[#a0a0b0]/20 border-[#a0a0b0] text-[#a0a0b0] font-bold'
                  : 'bg-[#17171b] border-[#26262c] text-[#8b8b94] hover:text-[#d9d9de]'
              )}
            >
              {s.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Sort By */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#8b8b94]">
          Sort By
        </span>
        <select
          value={selectedSort}
          onChange={(e) => setSelectedSort(e.target.value)}
          className="w-full h-8 bg-[#17171b] border border-[#26262c] text-xs font-mono text-[#d9d9de] px-2 rounded-[1px] focus:outline-none focus:border-[#a0a0b0]"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Genres */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#8b8b94]">
          Genres ({selectedGenres.length})
        </span>
        <div className="flex flex-wrap gap-1 max-h-48 overflow-y-auto pr-1">
          {GENRES.map((g) => {
            const slug = g.toLowerCase().replace(/\s+/g, '-')
            const isSelected = selectedGenres.includes(slug)

            return (
              <button
                key={g}
                type="button"
                onClick={() => toggleGenre(slug)}
                className={cn(
                  'px-2 py-0.5 text-[11px] font-mono rounded-[1px] border transition-colors',
                  isSelected
                    ? 'bg-[#a0a0b0] text-[#0b0b0d] border-[#a0a0b0] font-bold'
                    : 'bg-[#17171b] border-[#26262c] text-[#8b8b94] hover:text-[#d9d9de]'
                )}
              >
                {g}
              </button>
            )
          })}
        </div>
      </div>

      {/* Apply Button */}
      <Button variant="primary" size="md" fullWidth onClick={handleApply}>
        Apply Filters
      </Button>
    </div>
  )
}
