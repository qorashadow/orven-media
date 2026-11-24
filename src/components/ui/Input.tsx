'use client'

import React, { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Eye, EyeOff } from 'lucide-react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: ReactNode
  iconRight?: ReactNode
  compact?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, hint, icon, iconRight, disabled, id, compact = false, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type
    const inputId = id || props.name || undefined

    return (
      <div className={cn('w-full flex flex-col', compact ? 'gap-1' : 'gap-1.5')}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'font-medium uppercase tracking-wider text-[#8b8b94]',
              compact ? 'text-[10px] sm:text-[11px]' : 'text-xs'
            )}
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div
              className={cn(
                'absolute text-[#8b8b94] pointer-events-none flex items-center justify-center',
                compact ? 'left-2.5' : 'left-3'
              )}
            >
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            disabled={disabled}
            className={cn(
              'w-full bg-[#111114] border border-[#26262c] text-[#d9d9de] rounded-[2px] transition-colors duration-150 placeholder:text-[#56565e]',
              'focus:outline-none focus:border-[#a0a0b0] focus:ring-1 focus:ring-[#a0a0b0]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              compact ? 'h-8.5 sm:h-9 text-xs px-2.5' : 'h-10 text-sm px-3',
              icon && (compact ? 'pl-8' : 'pl-9'),
              (iconRight || isPassword) && (compact ? 'pr-8' : 'pr-9'),
              error && 'border-[#c43c3c] focus:border-[#c43c3c] focus:ring-[#c43c3c]',
              className
            )}
            {...props}
          />
          {isPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={cn(
                'absolute text-[#8b8b94] hover:text-[#d9d9de] transition-colors p-1',
                compact ? 'right-2' : 'right-3'
              )}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={compact ? 14 : 16} /> : <Eye size={compact ? 14 : 16} />}
            </button>
          ) : (
            iconRight && (
              <div
                className={cn(
                  'absolute text-[#8b8b94] pointer-events-none flex items-center justify-center',
                  compact ? 'right-2' : 'right-3'
                )}
              >
                {iconRight}
              </div>
            )
          )}
        </div>
        {error && <span className="text-[11px] text-[#c43c3c] font-medium">{error}</span>}
        {hint && !error && <span className="text-[11px] text-[#56565e]">{hint}</span>}
      </div>
    )
  }
)

Input.displayName = 'Input'
