'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange?: (page: number) => void
  basePath?: string
  searchParams?: Record<string, string | number | undefined>
  className?: string
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  basePath,
  searchParams,
  className,
}) => {
  if (totalPages <= 1) return null

  const getPageUrl = (p: number) => {
    if (!basePath) return '#'
    const params = new URLSearchParams()
    if (searchParams) {
      Object.entries(searchParams).forEach(([k, v]) => {
        if (v !== undefined && k !== 'page') params.set(k, v.toString())
      })
    }
    params.set('page', p.toString())
    return `${basePath}?${params.toString()}`
  }

  const getPages = () => {
    const pages: (number | string)[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages)
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
      }
    }
    return pages
  }

  const prevDisabled = currentPage <= 1
  const nextDisabled = currentPage >= totalPages

  const navButtonClass =
    'h-8 w-8 flex items-center justify-center bg-[#111114] border border-[#26262c] text-[#8b8b94] hover:text-[#d9d9de] hover:border-[#3a3a44] rounded-[1px] disabled:opacity-30 disabled:pointer-events-none transition-colors'

  return (
    <div className={cn('flex items-center justify-center gap-1 select-none', className)}>
      {basePath ? (
        prevDisabled ? (
          <span className={cn(navButtonClass, 'opacity-30 pointer-events-none')}>
            <ChevronLeft size={16} />
          </span>
        ) : (
          <Link href={getPageUrl(currentPage - 1)} className={navButtonClass} aria-label="Previous page">
            <ChevronLeft size={16} />
          </Link>
        )
      ) : (
        <button
          onClick={() => onPageChange?.(currentPage - 1)}
          disabled={prevDisabled}
          className={navButtonClass}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
      )}

      {getPages().map((page, index) => {
        if (page === '...') {
          return (
            <span
              key={`ellipsis-${index}`}
              className="h-8 w-8 flex items-center justify-center text-[#56565e]"
            >
              <MoreHorizontal size={14} />
            </span>
          )
        }

        const isCurrent = page === currentPage
        const pageNum = page as number
        const itemClass = cn(
          'h-8 min-w-[32px] px-2 text-xs font-mono flex items-center justify-center rounded-[1px] transition-colors',
          isCurrent
            ? 'bg-[#a0a0b0] text-[#0b0b0d] font-bold'
            : 'bg-[#111114] border border-[#26262c] text-[#8b8b94] hover:text-[#d9d9de] hover:border-[#3a3a44]'
        )

        if (basePath) {
          return (
            <Link key={`page-${page}`} href={getPageUrl(pageNum)} className={itemClass}>
              {page}
            </Link>
          )
        }

        return (
          <button
            key={`page-${page}`}
            onClick={() => onPageChange?.(pageNum)}
            className={itemClass}
          >
            {page}
          </button>
        )
      })}

      {basePath ? (
        nextDisabled ? (
          <span className={cn(navButtonClass, 'opacity-30 pointer-events-none')}>
            <ChevronRight size={16} />
          </span>
        ) : (
          <Link href={getPageUrl(currentPage + 1)} className={navButtonClass} aria-label="Next page">
            <ChevronRight size={16} />
          </Link>
        )
      ) : (
        <button
          onClick={() => onPageChange?.(currentPage + 1)}
          disabled={nextDisabled}
          className={navButtonClass}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  )
}
