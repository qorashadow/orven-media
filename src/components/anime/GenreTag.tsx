import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export interface GenreTagProps {
  name: string
  slug: string
  className?: string
}

export const GenreTag: React.FC<GenreTagProps> = ({ name, slug, className }) => {
  return (
    <Link
      href={`/browse?genre=${slug}`}
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-mono text-[#8b8b94] hover:text-[#d9d9de] bg-[#17171b] hover:bg-[#202026] border border-[#26262c] hover:border-[#3a3a44] rounded-[1px] transition-colors',
        className
      )}
    >
      {name}
    </Link>
  )
}
