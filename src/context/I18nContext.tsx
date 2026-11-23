'use client'

import React, { createContext, useContext, useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import enMessages from '@/messages/en.json'
import uzMessages from '@/messages/uz.json'
import ruMessages from '@/messages/ru.json'

export type Locale = 'en' | 'uz' | 'ru'

const dictionaries: Record<Locale, any> = {
  en: enMessages,
  uz: uzMessages,
  ru: ruMessages,
}

interface I18nContextType {
  locale: Locale
  setLocale: (newLocale: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
  formatDate: (date: Date | string) => string
  formatTime: (date: Date | string) => string
  formatTimeAgo: (date: Date | string) => string
  formatNumber: (num: number) => string
}

const I18nContext = createContext<I18nContextType | null>(null)

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null
  return null
}

function setCookie(name: string, value: string, days = 365) {
  if (typeof document === 'undefined') return
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`
}

export function I18nProvider({
  children,
  initialLocale = 'en',
}: {
  children: React.ReactNode
  initialLocale?: Locale
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  useEffect(() => {
    // Detect from cookie or browser on first client mount
    const saved = getCookie('locale') as Locale | null
    if (saved && (saved === 'en' || saved === 'uz' || saved === 'ru')) {
      if (saved !== locale) {
        setLocaleState(saved)
        document.documentElement.lang = saved
      }
    } else if (typeof navigator !== 'undefined') {
      const browserLang = navigator.language.toLowerCase()
      let detected: Locale = 'en'
      if (browserLang.startsWith('uz')) detected = 'uz'
      else if (browserLang.startsWith('ru')) detected = 'ru'

      if (detected !== 'en') {
        setLocaleState(detected)
        setCookie('locale', detected)
        document.documentElement.lang = detected
      }
    }
  }, [])

  const setLocale = (newLocale: Locale) => {
    if (newLocale === locale) return
    setLocaleState(newLocale)
    setCookie('locale', newLocale)
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLocale
    }

    // Persist in background if logged in
    fetch('/api/settings/locale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: newLocale }),
    }).catch(() => {})

    startTransition(() => {
      router.refresh()
    })
  }

  const t = (key: string, params?: Record<string, string | number>): string => {
    const dict = dictionaries[locale] || dictionaries.en
    const keys = key.split('.')
    let current: any = dict

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k]
      } else {
        // Fallback to English
        let fallback: any = dictionaries.en
        for (const fk of keys) {
          if (fallback && typeof fallback === 'object' && fk in fallback) {
            fallback = fallback[fk]
          } else {
            return key
          }
        }
        current = fallback
        break
      }
    }

    if (typeof current !== 'string') return key

    if (params) {
      return Object.entries(params).reduce((acc, [paramKey, paramVal]) => {
        return acc.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal))
      }, current)
    }

    return current
  }

  const formatDate = (date: Date | string): string => {
    try {
      const d = new Date(date)
      const loc = locale === 'uz' ? 'uz-UZ' : locale === 'ru' ? 'ru-RU' : 'en-US'
      return d.toLocaleDateString(loc, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return String(date)
    }
  }

  const formatTime = (date: Date | string): string => {
    try {
      const d = new Date(date)
      const loc = locale === 'uz' ? 'uz-UZ' : locale === 'ru' ? 'ru-RU' : 'en-US'
      return d.toLocaleTimeString(loc, {
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return ''
    }
  }

  const formatTimeAgo = (date: Date | string): string => {
    try {
      const now = new Date()
      const d = new Date(date)
      const seconds = Math.floor((now.getTime() - d.getTime()) / 1000)

      if (seconds < 60) return t('common.just_now')
      if (seconds < 3600) return t('common.minutes_ago', { count: Math.floor(seconds / 60) })
      if (seconds < 86400) return t('common.hours_ago', { count: Math.floor(seconds / 3600) })
      if (seconds < 604800) return t('common.days_ago', { count: Math.floor(seconds / 86400) })
      if (seconds < 2592000) return t('common.weeks_ago', { count: Math.floor(seconds / 604800) })
      return formatDate(d)
    } catch {
      return ''
    }
  }

  const formatNumber = (num: number): string => {
    try {
      const loc = locale === 'uz' ? 'uz-UZ' : locale === 'ru' ? 'ru-RU' : 'en-US'
      return new Intl.NumberFormat(loc).format(num)
    } catch {
      return String(num)
    }
  }

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        t,
        formatDate,
        formatTime,
        formatTimeAgo,
        formatNumber,
      }}
    >
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}
