import React from 'react'
import { db } from '@/lib/db'
import { AnimeGrid } from '@/components/anime/AnimeGrid'
import { FilterPanel } from '@/components/anime/FilterPanel'
import { Pagination } from '@/components/ui/Pagination'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface BrowsePageProps {
  searchParams: Promise<{
    type?: string
    category?: string
    genre?: string
    status?: string
    season?: string
    year?: string
    sort?: string
    page?: string
    q?: string
  }>
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const limit = 24
  const skip = (page - 1) * limit

  const where: any = {}

  if (params.type) where.type = params.type
  if (params.category) where.category = params.category
  if (params.status) where.status = params.status
  if (params.season) where.season = params.season
  if (params.year) where.year = parseInt(params.year)

  if (params.genre) {
    const slugs = params.genre.split(',').filter(Boolean)
    where.genres = {
      some: {
        genre: { slug: { in: slugs } },
      },
    }
  }

  if (params.q) {
    where.OR = [
      { title: { contains: params.q, mode: 'insensitive' } },
      { titleEnglish: { contains: params.q, mode: 'insensitive' } },
      { titleRomaji: { contains: params.q, mode: 'insensitive' } },
    ]
  }

  const orderBy: any = {}
  switch (params.sort) {
    case 'newest':
      orderBy.year = 'desc'
      break
    case 'score':
      orderBy.averageScore = 'desc'
      break
    case 'az':
      orderBy.title = 'asc'
      break
    case 'updated':
      orderBy.updatedAt = 'desc'
      break
    case 'trending':
      orderBy.trending = 'desc'
      break
    case 'popular':
    default:
      orderBy.popularity = 'desc'
      break
  }

  const [items, total] = await Promise.all([
    db.anime.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        genres: { include: { genre: true } },
      },
    }),
    db.anime.count({ where }),
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
      {/* Page Title & Count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#26262c]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-[#d9d9de]">
            Anime & Donghua Catalog
          </h1>
          <p className="text-xs text-[#8b8b94] mt-0.5">
            Explore thousands of streaming titles with high quality playback.
          </p>
        </div>
        <span className="text-xs font-mono text-[#8b8b94] bg-[#111114] border border-[#26262c] px-2.5 py-1 rounded-[1px] self-start sm:self-auto">
          {total} Titles found
        </span>
      </div>

      {/* Main Layout: Filters Sidebar + Grid */}
      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="w-full lg:w-64 shrink-0">
          <FilterPanel />
        </aside>

        <div className="flex-1 min-w-0 flex flex-col gap-6">
          <AnimeGrid items={items as any} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center pt-6">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                basePath="/browse"
                searchParams={params as any}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
