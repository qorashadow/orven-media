'use client'

import React, { useState } from 'react'
import { Star } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'

export interface RatingWidgetProps {
  animeId: string
  averageScore?: number | null
  userScore?: number | null
  ratingsCount?: number
  className?: string
}

export const RatingWidget: React.FC<RatingWidgetProps> = ({
  animeId,
  averageScore,
  userScore: initialUserScore,
  ratingsCount = 0,
  className,
}) => {
  const [userScore, setUserScore] = useState<number | null>(initialUserScore || null)
  const [hoverScore, setHoverScore] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const { data: session } = useSession()
  const { success, error } = useToast()

  const handleRate = async (score: number) => {
    if (!session?.user) {
      error('Please sign in to rate this anime')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ animeId, score }),
      })

      if (res.ok) {
        setUserScore(score)
        success(`Rated ${score}/10`)
      }
    } catch {
      error('Failed to save rating')
    } finally {
      setLoading(false)
    }
  }

  const activeScore = hoverScore !== null ? hoverScore : userScore || 0

  return (
    <div className={cn('flex flex-col gap-1.5 p-3 bg-[#111114] border border-[#26262c] rounded-[2px]', className)}>
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-[#8b8b94] uppercase tracking-wider">Rating</span>
        {averageScore && (
          <span className="text-[#b8942c] font-bold flex items-center gap-1">
            <Star size={12} className="fill-[#b8942c]" />
            {(averageScore / 10).toFixed(1)} / 10
            <span className="text-[#56565e] font-normal">({ratingsCount})</span>
          </span>
        )}
      </div>

      {/* 10 Star Rating Bar */}
      <div className="flex items-center justify-between gap-1 py-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => {
          const filled = star <= activeScore

          return (
            <button
              key={star}
              type="button"
              disabled={loading}
              onClick={() => handleRate(star)}
              onMouseEnter={() => setHoverScore(star)}
              onMouseLeave={() => setHoverScore(null)}
              className="p-1 hover:scale-125 transition-transform"
              title={`Rate ${star} / 10`}
            >
              <Star
                size={16}
                className={cn(
                  'transition-colors',
                  filled ? 'fill-[#b8942c] text-[#b8942c]' : 'text-[#26262c]'
                )}
              />
            </button>
          )
        })}
      </div>

      <div className="text-[10px] font-mono text-center text-[#56565e]">
        {userScore ? (
          <span className="text-[#a0a0b0]">Your rating: {userScore}/10</span>
        ) : (
          <span>Click a star to rate</span>
        )}
      </div>
    </div>
  )
}
