import React from 'react'
import Link from 'next/link'
import { db } from '@/lib/db'
import { Tag } from 'lucide-react'

export const revalidate = 3600

export default async function GenresPage() {
  const genres = await db.genre.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { anime: true },
      },
    },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
      <div className="flex items-center gap-3 pb-4 border-b border-[#26262c]">
        <Tag size={22} className="text-[#a0a0b0]" />
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-[#d9d9de]">
            Anime & Donghua Genres
          </h1>
          <p className="text-xs text-[#8b8b94] mt-0.5">
            Browse through {genres.length} animation genres and themes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {genres.map((genre) => (
          <Link
            key={genre.id}
            href={`/browse?genre=${genre.slug}`}
            className="flex items-center justify-between p-3.5 bg-[#111114] border border-[#26262c] hover:border-[#a0a0b0]/50 rounded-[2px] transition-all group"
          >
            <span className="text-xs font-semibold text-[#d9d9de] group-hover:text-[#a0a0b0] transition-colors">
              {genre.name}
            </span>
            <span className="text-[10px] font-mono text-[#56565e] bg-[#17171b] px-1.5 py-0.5 rounded-[1px]">
              {genre._count.anime}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
