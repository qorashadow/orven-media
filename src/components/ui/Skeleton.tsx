import React from 'react'
import { cn } from '@/lib/utils'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rectangular' | 'circular' | 'card'
  width?: string | number
  height?: string | number
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  width,
  height,
  style,
  ...props
}) => {
  const customStyle: React.CSSProperties = {
    ...style,
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
  }

  const variants = {
    text: 'h-4 w-full rounded-[1px]',
    rectangular: 'rounded-[2px]',
    circular: 'rounded-full',
    card: 'aspect-[2/3] w-full rounded-[2px]',
  }

  return (
    <div
      className={cn('skeleton bg-[#17171b]', variants[variant], className)}
      style={customStyle}
      {...props}
    />
  )
}
