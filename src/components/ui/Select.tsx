'use client'

import React, { useState, useRef, useEffect, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown, Check } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps {
  options: (SelectOption | { readonly value: string; readonly label: string })[] | readonly (SelectOption | { readonly value: string; readonly label: string })[]
  value?: string | string[]
  onChange?: (value: string | string[]) => void
  label?: string
  placeholder?: string
  error?: string
  multiple?: boolean
  disabled?: boolean
  className?: string
}

export const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      options,
      value,
      onChange,
      label,
      placeholder = 'Select an option',
      error,
      multiple = false,
      disabled = false,
      className,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSelect = (optionValue: string) => {
      if (multiple) {
        const currentVals = Array.isArray(value) ? [...value] : []
        const exists = currentVals.includes(optionValue)
        const updated = exists ? currentVals.filter((v) => v !== optionValue) : [...currentVals, optionValue]
        onChange?.(updated)
      } else {
        onChange?.(optionValue)
        setIsOpen(false)
      }
    }

    const getSelectedLabel = () => {
      if (!value || (Array.isArray(value) && value.length === 0)) {
        return <span className="text-[#56565e]">{placeholder}</span>
      }
      if (multiple && Array.isArray(value)) {
        return (
          <span className="truncate">
            {value.map((v) => options.find((opt) => opt.value === v)?.label || v).join(', ')}
          </span>
        )
      }
      const match = options.find((opt) => opt.value === value)
      return match ? match.label : String(value)
    }

    return (
      <div ref={ref || containerRef} className={cn('w-full flex flex-col gap-1.5 relative', className)}>
        {label && (
          <label className="text-xs font-medium uppercase tracking-wider text-[#8b8b94]">{label}</label>
        )}
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            'w-full h-10 bg-[#111114] border border-[#26262c] text-[#d9d9de] text-sm px-3 rounded-[2px] flex items-center justify-between transition-colors duration-150',
            'focus:outline-none focus:border-[#a0a0b0] focus:ring-1 focus:ring-[#a0a0b0]',
            disabled && 'opacity-50 cursor-not-allowed',
            error && 'border-[#c43c3c]'
          )}
        >
          {getSelectedLabel()}
          <ChevronDown
            size={16}
            className={cn('text-[#8b8b94] transition-transform duration-150 shrink-0 ml-2', isOpen && 'rotate-180')}
          />
        </button>

        {isOpen && (
          <div className="absolute top-[calc(100%+4px)] left-0 w-full z-50 bg-[#17171b] border border-[#26262c] rounded-[2px] shadow-xl max-h-60 overflow-y-auto py-1">
            {options.length === 0 ? (
              <div className="p-3 text-xs text-[#8b8b94] text-center">No options available</div>
            ) : (
              options.map((option) => {
                const isSelected = multiple
                  ? Array.isArray(value) && value.includes(option.value)
                  : value === option.value

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      'w-full px-3 py-2 text-sm text-left flex items-center justify-between transition-colors',
                      isSelected ? 'bg-[#a0a0b0]/15 text-[#a0a0b0] font-medium' : 'text-[#d9d9de] hover:bg-[#202026]'
                    )}
                  >
                    <span>{option.label}</span>
                    {isSelected && <Check size={14} className="text-[#a0a0b0]" />}
                  </button>
                )
              })
            )}
          </div>
        )}
        {error && <span className="text-xs text-[#c43c3c] font-medium">{error}</span>}
      </div>
    )
  }
)

Select.displayName = 'Select'
