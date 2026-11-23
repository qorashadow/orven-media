'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface SliderProps {
  min: number
  max: number
  step?: number
  value: number
  onChange: (val: number) => void
  label?: string
  showValue?: boolean
  unit?: string
  disabled?: boolean
  className?: string
}

export const Slider: React.FC<SliderProps> = ({
  min,
  max,
  step = 1,
  value,
  onChange,
  label,
  showValue = true,
  unit = '',
  disabled = false,
  className,
}) => {
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className={cn('w-full flex flex-col gap-1.5', className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center text-xs">
          {label && <span className="font-medium uppercase tracking-wider text-[#8b8b94]">{label}</span>}
          {showValue && (
            <span className="font-mono text-[#d9d9de]">
              {value}
              {unit}
            </span>
          )}
        </div>
      )}
      <div className="relative flex items-center h-5">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1 bg-[#17171b] border border-[#26262c] rounded-[1px] appearance-none cursor-pointer accent-[#a0a0b0] focus:outline-none disabled:opacity-50"
          style={{
            background: `linear-gradient(to right, #a0a0b0 0%, #a0a0b0 ${percentage}%, #17171b ${percentage}%, #17171b 100%)`,
          }}
        />
      </div>
    </div>
  )
}
