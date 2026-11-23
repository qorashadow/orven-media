'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface TabItem {
  id: string
  label: React.ReactNode
  icon?: React.ReactNode
  badge?: number | string
}

export interface TabsProps {
  tabs: TabItem[]
  activeTab: string
  onChange: (id: string) => void
  className?: string
  variant?: 'underline' | 'pill'
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className,
  variant = 'underline',
}) => {
  return (
    <div
      className={cn(
        'flex items-center gap-1 overflow-x-auto scrollbar-none',
        variant === 'underline' && 'border-b border-[#26262c]',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id

        if (variant === 'pill') {
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-[2px] flex items-center gap-2 whitespace-nowrap transition-colors duration-150',
                isActive
                  ? 'bg-[#a0a0b0] text-[#0b0b0d] font-semibold'
                  : 'text-[#8b8b94] hover:text-[#d9d9de] hover:bg-[#17171b]'
              )}
            >
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={cn(
                    'text-[10px] px-1 py-0.2 rounded font-mono',
                    isActive ? 'bg-[#0b0b0d]/20 text-[#0b0b0d]' : 'bg-[#26262c] text-[#8b8b94]'
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          )
        }

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium flex items-center gap-2 relative whitespace-nowrap transition-colors duration-150',
              isActive ? 'text-[#d9d9de] font-semibold' : 'text-[#8b8b94] hover:text-[#d9d9de]'
            )}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className="text-[10px] font-mono bg-[#17171b] border border-[#26262c] text-[#8b8b94] px-1.5 py-0.5 rounded-[1px]">
                {tab.badge}
              </span>
            )}
            {isActive && (
              <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#a0a0b0]" />
            )}
          </button>
        )
      })}
    </div>
  )
}
