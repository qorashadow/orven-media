'use client'

import React, { useState } from 'react'
import { Bookmark, Check, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { WATCHLIST_STATUSES } from '@/lib/constants'
import { useSession } from 'next-auth/react'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'

export interface WatchlistButtonProps {
  animeId: string
  currentStatus?: string | null
  className?: string
}

export const WatchlistButton: React.FC<WatchlistButtonProps> = ({
  animeId,
  currentStatus: initialStatus,
  className,
}) => {
  const [status, setStatus] = useState<string | null>(initialStatus || null)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { data: session } = useSession()
  const { success, error } = useToast()

  const handleStatusSelect = async (newStatus: string) => {
    if (!session?.user) {
      error('Please sign in to update your watchlist')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ animeId, status: newStatus }),
      })

      if (res.ok) {
        setStatus(newStatus)
        setIsOpen(false)
        const label = WATCHLIST_STATUSES.find((s) => s.value === newStatus)?.label || newStatus
        success(`Set to "${label}"`)
      }
    } catch {
      error('Failed to update watchlist')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/watchlist?animeId=${animeId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setStatus(null)
        setIsOpen(false)
        success('Removed from watchlist')
      }
    } catch {
      error('Failed to remove')
    } finally {
      setLoading(false)
    }
  }

  const currentLabel = WATCHLIST_STATUSES.find((s) => s.value === status)?.label || 'Add to List'

  return (
    <div className={cn('relative inline-block', className)}>
      <Button
        variant={status ? 'accent' : 'secondary'}
        size="md"
        loading={loading}
        icon={<Bookmark size={15} className={status ? 'fill-[#a0a0b0]' : ''} />}
        iconRight={<ChevronDown size={14} className={cn('transition-transform', isOpen && 'rotate-180')} />}
        onClick={() => setIsOpen(!isOpen)}
      >
        {currentLabel}
      </Button>

      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] left-0 z-50 bg-[#17171b] border border-[#26262c] rounded-[2px] shadow-2xl py-1 min-w-[170px]">
          {WATCHLIST_STATUSES.map((item) => {
            const isSelected = status === item.value

            return (
              <button
                key={item.value}
                type="button"
                onClick={() => handleStatusSelect(item.value)}
                className={cn(
                  'w-full px-3 py-2 text-xs flex items-center justify-between text-left transition-colors',
                  isSelected ? 'bg-[#a0a0b0]/15 text-[#a0a0b0] font-bold' : 'text-[#d9d9de] hover:bg-[#202026]'
                )}
              >
                <span>{item.label}</span>
                {isSelected && <Check size={14} />}
              </button>
            )
          })}

          {status && (
            <>
              <div className="h-[1px] bg-[#26262c] my-1" />
              <button
                type="button"
                onClick={handleRemove}
                className="w-full px-3 py-2 text-xs text-[#c43c3c] hover:bg-[#c43c3c]/10 text-left transition-colors"
              >
                Remove from List
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
