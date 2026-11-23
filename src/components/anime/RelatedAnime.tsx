import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { AnimeCard } from '@/types'

export interface RelatedAnimeProps {
  relations: {
    target: AnimeCard
    relationType: string
  }[]
  className?: string
}

export const RelatedAnime: React.FC<RelatedAnimeProps> = ({ relations, className }) => {
  if (!relations || relations.length === 0) return null

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-[#d9d9de] flex items-center gap-2">
        <span className="w-1.5 h-3.5 bg-[#a0a0b0] rounded-[1px] inline-block" />
        Related Media
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
        {relations.map((rel, index) => (
          <Link
            key={`rel-${index}`}
            href={`/anime/${rel.target.slug}`}
            className="flex items-center gap-3 p-2 bg-[#111114] border border-[#26262c] hover:border-[#3a3a44] rounded-[2px] transition-colors group"
          >
            <div className="relative w-10 h-14 bg-[#17171b] rounded-[1px] overflow-hidden shrink-0 border border-[#26262c]">
              {rel.target.poster && (
                <Image
                  src={rel.target.poster}
                  alt={rel.target.title}
                  fill
                  sizes="40px"
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-mono text-[#a0a0b0] uppercase tracking-wider block">
                {rel.relationType.replace(/_/g, ' ')}
              </span>
              <h5 className="text-xs font-medium text-[#d9d9de] group-hover:text-[#a0a0b0] truncate transition-colors mt-0.5">
                {rel.target.title}
              </h5>
              <span className="text-[10px] font-mono text-[#56565e]">
                {rel.target.type} {rel.target.year ? `• ${rel.target.year}` : ''}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
