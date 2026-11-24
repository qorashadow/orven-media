'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useI18n } from '@/context/I18nContext'

interface BackToHomeProps {
  className?: string
}

export function BackToHome({ className = '' }: BackToHomeProps) {
  const { t } = useI18n()

  return (
    <Link
      href="/"
      aria-label="Back to Home"
      className={`fixed top-3 left-3 sm:top-5 sm:left-6 z-30 inline-flex items-center gap-2 text-xs font-mono text-[#8b8b94] hover:text-[#d9d9de] transition-colors px-2.5 py-1.5 rounded-[2px] bg-[#111114]/90 backdrop-blur-sm border border-[#26262c] hover:border-[#3e3e48] group shadow-sm ${className}`}
    >
      <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform text-[#a0a0b0]" />
      <span>{t('common.back_to_home') || 'Back to Home'}</span>
    </Link>
  )
}
