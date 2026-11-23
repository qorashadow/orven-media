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
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, hint, icon, iconRight, disabled, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type
    const inputId = id || props.name || undefined

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium uppercase tracking-wider text-[#8b8b94]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3 text-[#8b8b94] pointer-events-none flex items-center justify-center">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            disabled={disabled}
            className={cn(
              'w-full h-10 bg-[#111114] border border-[#26262c] text-[#d9d9de] text-sm px-3 rounded-[2px] transition-colors duration-150 placeholder:text-[#56565e]',
              'focus:outline-none focus:border-[#a0a0b0] focus:ring-1 focus:ring-[#a0a0b0]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              icon && 'pl-9',
              (iconRight || isPassword) && 'pr-9',
              error && 'border-[#c43c3c] focus:border-[#c43c3c] focus:ring-[#c43c3c]',
              className
            )}
            {...props}
          />
          {isPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-[#8b8b94] hover:text-[#d9d9de] transition-colors p-1"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          ) : (
            iconRight && (
              <div className="absolute right-3 text-[#8b8b94] pointer-events-none flex items-center justify-center">
                {iconRight}
              </div>
            )
          )}
        </div>
        {error && <span className="text-xs text-[#c43c3c] font-medium">{error}</span>}
        {hint && !error && <span className="text-xs text-[#56565e]">{hint}</span>}
      </div>
    )
  }
)

Input.displayName = 'Input'
