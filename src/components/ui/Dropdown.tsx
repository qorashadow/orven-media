'use client'

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

export interface DropdownItem {
  id?: string
  label: React.ReactNode
  icon?: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  danger?: boolean
  divider?: boolean
}

export interface DropdownProps {
  trigger: React.ReactNode
  items: DropdownItem[]
  align?: 'left' | 'right'
  className?: string
  width?: string
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = 'right',
  className,
  width = 'w-48',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={cn(
            'absolute top-[calc(100%+6px)] z-50 bg-[#17171b] border border-[#26262c] rounded-[2px] shadow-2xl py-1 focus:outline-none',
            align === 'right' ? 'right-0' : 'left-0',
            width,
            className
          )}
        >
          {items.map((item, index) => {
            if (item.divider) {
              return <div key={`divider-${index}`} className="h-[1px] bg-[#26262c] my-1" />
            }

            return (
              <button
                key={item.id || index}
                disabled={item.disabled}
                onClick={() => {
                  item.onClick?.()
                  setIsOpen(false)
                }}
                className={cn(
                  'w-full px-3 py-2 text-xs flex items-center gap-2 text-left transition-colors',
                  item.danger
                    ? 'text-[#c43c3c] hover:bg-[#c43c3c]/10'
                    : 'text-[#d9d9de] hover:bg-[#202026] hover:text-white',
                  item.disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {item.icon && <span className="shrink-0 text-[#8b8b94]">{item.icon}</span>}
                <span className="truncate">{item.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
