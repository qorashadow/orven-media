'use client'

import React, { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  loading?: boolean
  icon?: ReactNode
  iconRight?: ReactNode
  clipCorner?: boolean
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      icon,
      iconRight,
      clipCorner = false,
      fullWidth = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#a0a0b0] disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]'

    const variants = {
      primary:
        'bg-[#a0a0b0] text-[#0b0b0d] hover:bg-[#b8b8c8] font-semibold shadow-sm',
      secondary:
        'bg-[#17171b] text-[#d9d9de] border border-[#26262c] hover:border-[#3a3a44] hover:bg-[#202026]',
      ghost:
        'text-[#8b8b94] hover:text-[#d9d9de] hover:bg-[#17171b]',
      danger:
        'bg-[#c43c3c] text-white hover:bg-[#d64d4d]',
      accent:
        'bg-[#111114] border border-[#a0a0b0]/40 text-[#a0a0b0] hover:border-[#a0a0b0] hover:bg-[#a0a0b0]/10',
      outline:
        'border border-[#26262c] text-[#d9d9de] hover:bg-[#17171b] hover:border-[#3a3a44]',
    }

    const sizes = {
      sm: 'h-8 px-3 text-xs gap-1.5 rounded-[1px]',
      md: 'h-10 px-4 text-sm gap-2 rounded-[2px]',
      lg: 'h-12 px-6 text-base gap-2.5 rounded-[2px]',
      icon: 'h-10 w-10 p-0 text-sm justify-center rounded-[2px]',
    }

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          clipCorner && 'clip-corner-tr',
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          icon && <span className="shrink-0">{icon}</span>
        )}
        {children}
        {iconRight && <span className="shrink-0">{iconRight}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'
