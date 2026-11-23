import React from 'react'
import { db } from '@/lib/db'
import { TopTenCard } from '@/components/anime/TopTenCard'
import { Trophy } from 'lucide-react'

export const revalidate = 300

export default async function TopPage() {
  const topAnime = await db.anime.findMany({
    orderBy: { averageScore: 'desc' },
    take: 50,
    include: {
      genres: { include: { genre: true } },
    },
  })

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
      <div className="flex items-center gap-3 pb-4 border-b border-[#26262c]">
        <Trophy size={24} className="text-[#b8942c]" />
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-[#d9d9de]">
            Top Rated Anime & Donghua
          </h1>
          <p className="text-xs text-[#8b8b94] mt-0.5">
            Highest community rated titles of all time.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {topAnime.map((anime, index) => (
          <TopTenCard key={anime.id} rank={index + 1} anime={anime as any} />
        ))}
      </div>
    </div>
  )
}
