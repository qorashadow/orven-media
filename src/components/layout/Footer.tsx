'use client'

import React from 'react'
import Link from 'next/link'
import { useI18n } from '@/context/I18nContext'

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()
  const { t, locale, setLocale } = useI18n()

  return (
    <footer className="w-full bg-[#0b0b0d] border-t border-[#26262c] mt-20 text-[#8b8b94] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#a0a0b0] text-[#0b0b0d] font-bold text-[10px] flex items-center justify-center font-heading clip-corner-tr">
                OM
              </div>
              <span className="font-heading font-extrabold text-base text-[#d9d9de] tracking-tight">
                ORVEN <span className="font-light text-[#8b8b94] tracking-widest">MEDIA</span>
              </span>
            </div>
            <p className="text-[#8b8b94] max-w-sm text-xs leading-relaxed">
              {t('footer.description')}
            </p>
            <div className="text-[11px] text-[#56565e] mt-2 leading-relaxed">
              {t('footer.disclaimer')}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-2">
            <span className="font-mono uppercase tracking-wider text-[11px] text-[#d9d9de] font-semibold mb-1">
              {t('footer.explore')}
            </span>
            <Link href="/anime" className="hover:text-[#d9d9de] transition-colors">{t('footer.anime_catalog')}</Link>
            <Link href="/donghua" className="hover:text-[#d9d9de] transition-colors">{t('footer.donghua_catalog')}</Link>
            <Link href="/movies" className="hover:text-[#d9d9de] transition-colors">{t('footer.movies')}</Link>
            <Link href="/schedule" className="hover:text-[#d9d9de] transition-colors">{t('footer.release_schedule')}</Link>
            <Link href="/top" className="hover:text-[#d9d9de] transition-colors">{t('footer.top_airing')}</Link>
            <Link href="/genres" className="hover:text-[#d9d9de] transition-colors">{t('footer.genres')}</Link>
          </div>

          {/* Legal and Support */}
          <div className="flex flex-col gap-2">
            <span className="font-mono uppercase tracking-wider text-[11px] text-[#d9d9de] font-semibold mb-1">
              {t('footer.platform')}
            </span>
            <Link href="/request" className="hover:text-[#d9d9de] transition-colors">{t('footer.request_anime')}</Link>
            <Link href="/news" className="hover:text-[#d9d9de] transition-colors">{t('footer.announcements_news')}</Link>
            <Link href="/faq" className="hover:text-[#d9d9de] transition-colors">{t('footer.faq')}</Link>
            <Link href="/about" className="hover:text-[#d9d9de] transition-colors">{t('footer.about_us')}</Link>
            <Link href="/contact" className="hover:text-[#d9d9de] transition-colors">{t('footer.contact')}</Link>
            <Link href="/terms" className="hover:text-[#d9d9de] transition-colors">{t('footer.terms_of_service')}</Link>
            <Link href="/privacy" className="hover:text-[#d9d9de] transition-colors">{t('footer.privacy_policy')}</Link>
            <Link href="/dmca" className="hover:text-[#d9d9de] transition-colors">{t('footer.dmca_disclaimer')}</Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[#17171b] flex flex-col sm:flex-row items-center justify-between gap-4 text-[#56565e] text-[11px]">
          <div>
            &copy; {currentYear} <span className="text-[#8b8b94]">Orven Media</span>. {t('footer.all_rights_reserved')}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 font-mono">
              {(['uz', 'ru', 'en'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLocale(l)}
                  className={`uppercase hover:text-[#d9d9de] px-1 py-0.5 rounded-[1px] transition-colors ${
                    locale === l ? 'text-[#a0a0b0] font-bold underline' : 'text-[#56565e]'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
            <span>•</span>
            <span className="font-mono">v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
