'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface PasswordStrengthProps {
  password?: string
  className?: string
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password = '', className }) => {
  if (!password) return null

  let strength = 0
  if (password.length >= 8) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[a-z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^A-Za-z0-9]/.test(password)) strength++

  const labels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = [
    'bg-[#c43c3c]',
    'bg-[#c43c3c]',
    'bg-[#b8942c]',
    'bg-[#3c8c5c]',
    'bg-[#3c8c5c]',
  ]

  const activeLevel = Math.min(strength, 4)

  return (
    <div className={cn('flex flex-col gap-0.5 w-full', className)}>
      <div className="flex gap-1 h-1">
        {[0, 1, 2, 3].map((step) => (
          <div
            key={step}
            className={cn(
              'h-full flex-1 rounded-[1px] transition-colors',
              step < strength ? colors[activeLevel] : 'bg-[#26262c]'
            )}
          />
        ))}
      </div>
      <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-mono text-[#8b8b94] leading-tight">
        <span>Password strength:</span>
        <span className="text-[#d9d9de] font-semibold">{labels[activeLevel]}</span>
      </div>
    </div>
  )
}
