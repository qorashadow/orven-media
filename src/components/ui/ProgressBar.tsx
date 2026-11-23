import React from 'react'
import { cn } from '@/lib/utils'

export interface ProgressBarProps {
  value: number // 0 to 100
  max?: number
  showLabel?: boolean
  size?: 'xs' | 'sm' | 'md'
  variant?: 'accent' | 'success' | 'danger'
  className?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  showLabel = false,
  size = 'sm',
  variant = 'accent',
  className,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const sizes = {
    xs: 'h-1',
    sm: 'h-1.5',
    md: 'h-2.5',
  }

  const variants = {
    accent: 'bg-[#a0a0b0]',
    success: 'bg-[#3c8c5c]',
    danger: 'bg-[#c43c3c]',
  }

  return (
    <div className={cn('w-full flex items-center gap-2', className)}>
      <div className={cn('w-full bg-[#17171b] overflow-hidden rounded-[1px]', sizes[size])}>
        <div
          className={cn('h-full transition-all duration-300 ease-out', variants[variant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-[10px] font-mono text-[#8b8b94] shrink-0">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  )
}
