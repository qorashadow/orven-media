import { cookies, headers } from 'next/headers'
import enMessages from '@/messages/en.json'
import uzMessages from '@/messages/uz.json'
import ruMessages from '@/messages/ru.json'

export type Locale = 'en' | 'uz' | 'ru'

const dictionaries: Record<Locale, any> = {
  en: enMessages,
  uz: uzMessages,
  ru: ruMessages,
}

export async function getServerLocale(): Promise<Locale> {
  try {
    const cookieStore = await cookies()
    const localeCookie = cookieStore.get('locale')?.value as Locale | undefined

    if (localeCookie === 'en' || localeCookie === 'uz' || localeCookie === 'ru') {
      return localeCookie
    }

    const headersList = await headers()
    const acceptLang = headersList.get('accept-language')?.toLowerCase() || ''
    if (acceptLang.includes('uz')) return 'uz'
    if (acceptLang.includes('ru')) return 'ru'

    return 'en'
  } catch {
    return 'en'
  }
}

export function getServerTranslations(locale: Locale) {
  const dict = dictionaries[locale] || dictionaries.en

  const t = (key: string, params?: Record<string, string | number>): string => {
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

  return { t, locale, messages: dict }
}
