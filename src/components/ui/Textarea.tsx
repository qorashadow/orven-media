'use client'

import React, { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  showCount?: boolean
  maxLength?: number
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, showCount, maxLength, value, id, ...props }, ref) => {
    const inputId = id || props.name || undefined
    const currentLength = typeof value === 'string' ? value.length : 0

    return (
      <div className="w-full flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          {label && (
            <label htmlFor={inputId} className="text-xs font-medium uppercase tracking-wider text-[#8b8b94]">
              {label}
            </label>
          )}
          {showCount && maxLength && (
            <span className="text-xs text-[#56565e]">
              {currentLength} / {maxLength}
            </span>
          )}
        </div>
        <textarea
          ref={ref}
          id={inputId}
          maxLength={maxLength}
          value={value}
          className={cn(
            'w-full min-h-[100px] bg-[#111114] border border-[#26262c] text-[#d9d9de] text-sm p-3 rounded-[2px] transition-colors duration-150 placeholder:text-[#56565e] resize-y',
            'focus:outline-none focus:border-[#a0a0b0] focus:ring-1 focus:ring-[#a0a0b0]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-[#c43c3c] focus:border-[#c43c3c] focus:ring-[#c43c3c]',
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-[#c43c3c] font-medium">{error}</span>}
        {hint && !error && <span className="text-xs text-[#56565e]">{hint}</span>}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
