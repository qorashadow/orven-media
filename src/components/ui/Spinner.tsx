import React from 'react'
import { cn } from '@/lib/utils'

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className }) => {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-10 w-10 border-3',
  }

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-t-[#a0a0b0] border-r-transparent border-b-[#26262c] border-l-transparent',
        sizes[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  )
}
