import React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'accent' | 'secondary' | 'danger' | 'success' | 'warning' | 'outline'
  size?: 'sm' | 'md'
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'sm',
  children,
  ...props
}) => {
  const variants = {
    default: 'bg-[#17171b] text-[#d9d9de] border border-[#26262c]',
    accent: 'bg-[#a0a0b0]/15 text-[#a0a0b0] border border-[#a0a0b0]/30',
    secondary: 'bg-[#111114] text-[#8b8b94] border border-[#26262c]',
    danger: 'bg-[#c43c3c]/15 text-[#c43c3c] border border-[#c43c3c]/30',
    success: 'bg-[#3c8c5c]/15 text-[#3c8c5c] border border-[#3c8c5c]/30',
    warning: 'bg-[#b8942c]/15 text-[#b8942c] border border-[#b8942c]/30',
    outline: 'border border-[#26262c] text-[#8b8b94]',
  }

  const sizes = {
    sm: 'text-[10px] px-1.5 py-0.5 tracking-wider font-mono uppercase rounded-[1px]',
    md: 'text-xs px-2.5 py-1 tracking-wider font-mono uppercase rounded-[2px]',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium select-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
