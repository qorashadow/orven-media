import React from 'react'
import { db } from '@/lib/db'
import { AnimeGrid } from '@/components/anime/AnimeGrid'
import { Search } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = '' } = await searchParams
  const query = q.trim()

  const items = query
    ? await db.anime.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { titleEnglish: { contains: query, mode: 'insensitive' } },
            { titleRomaji: { contains: query, mode: 'insensitive' } },
            { titleNative: { contains: query, mode: 'insensitive' } },
          ],
        },
        orderBy: { popularity: 'desc' },
        take: 36,
        include: {
          genres: { include: { genre: true } },
        },
      })
    : []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
      <div className="flex items-center gap-3 pb-4 border-b border-[#26262c]">
        <Search size={22} className="text-[#a0a0b0]" />
        <div>
          <h1 className="text-xl font-bold font-heading text-[#d9d9de]">
            {query ? `Search results for "${query}"` : 'Search Anime & Donghua'}
          </h1>
          <span className="text-xs font-mono text-[#8b8b94]">
            {items.length} results found
          </span>
        </div>
      </div>

      <AnimeGrid items={items as any} />
    </div>
  )
}
