'use client'

import React, { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface RatingProps {
  value: number // 1 to 10
  onChange?: (val: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showScore?: boolean
}

export const Rating: React.FC<RatingProps> = ({
  value,
  onChange,
  readonly = false,
  size = 'md',
  className,
  showScore = true,
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null)

  const starSizes = {
    sm: 14,
    md: 18,
    lg: 24,
  }

  const currentValue = hoverValue !== null ? hoverValue : value

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => {
          const isFilled = star <= currentValue

          return (
            <button
              key={star}
              type="button"
              disabled={readonly}
              onClick={() => onChange?.(star)}
              onMouseEnter={() => !readonly && setHoverValue(star)}
              onMouseLeave={() => !readonly && setHoverValue(null)}
              className={cn(
                'p-0.5 transition-transform duration-100',
                !readonly && 'hover:scale-110 cursor-pointer focus:outline-none',
                readonly && 'cursor-default'
              )}
              aria-label={`Rate ${star} out of 10`}
            >
              <Star
                size={starSizes[size]}
                className={cn(
                  'transition-colors',
                  isFilled ? 'fill-[#b8942c] text-[#b8942c]' : 'text-[#26262c]'
                )}
              />
            </button>
          )
        })}
      </div>

      {showScore && (
        <span className="text-xs font-mono font-medium text-[#8b8b94] ml-1">
          {currentValue > 0 ? currentValue.toFixed(1) : '-'}/10
        </span>
      )}
    </div>
  )
}
