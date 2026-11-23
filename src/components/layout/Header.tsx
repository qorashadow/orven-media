'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Search, Bell, Menu, X, Dices, User as UserIcon, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from '@/lib/constants'
import { Button } from '@/components/ui/Button'
import { SearchOverlay } from './SearchOverlay'
import { NotificationDropdown } from './NotificationDropdown'
import { UserMenu } from './UserMenu'
import { useSession } from 'next-auth/react'
import { useI18n, type Locale } from '@/context/I18nContext'

const navKeyMap: Record<string, string> = {
  '/': 'header.home',
  '/anime': 'header.anime',
  '/donghua': 'header.donghua',
  '/movies': 'header.movies',
  '/schedule': 'header.schedule',
  '/genres': 'header.genres',
  '/top': 'header.top',
  '/random': 'header.random',
  '/browse': 'header.browse',
}

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const { t, locale, setLocale } = useI18n()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on page change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const handleRandom = async () => {
    try {
      const res = await fetch('/api/anime/random')
      const data = await res.json()
      if (data.slug) {
        router.push(`/anime/${data.slug}`)
      } else {
        router.push('/browse')
      }
    } catch {
      router.push('/browse')
    }
  }

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 h-16 transition-all duration-200 border-b',
          isScrolled
            ? 'bg-[#0b0b0d]/95 backdrop-blur-md border-[#26262c] shadow-lg'
            : 'bg-gradient-to-b from-[#0b0b0d]/90 to-transparent border-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Left: Mobile hamburger + Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-[#8b8b94] hover:text-[#d9d9de] p-1.5 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 bg-[#a0a0b0] text-[#0b0b0d] font-bold text-xs flex items-center justify-center font-heading clip-corner-tr">
                OM
              </div>
              <div className="flex items-baseline tracking-wider">
                <span className="font-heading font-extrabold text-lg text-[#d9d9de] tracking-tight">
                  ORVEN
                </span>
                <span className="font-heading font-light text-lg text-[#8b8b94] ml-1 tracking-widest">
                  MEDIA
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {NAV_ITEMS.map((item) => {
              if (item.href === '/random') return null
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
              const labelKey = navKeyMap[item.href] || item.label
              const displayLabel = labelKey.startsWith('header.') ? t(labelKey) : item.label

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-3 py-1.5 text-xs uppercase tracking-wider font-medium transition-colors rounded-[1px]',
                    isActive
                      ? 'text-[#d9d9de] bg-[#17171b] border border-[#26262c] font-semibold'
                      : 'text-[#8b8b94] hover:text-[#d9d9de] hover:bg-[#111114]'
                  )}
                >
                  {displayLabel}
                </Link>
              )
            })}
          </nav>

          {/* Right Actions: Language, Random, Search, Notifications, Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Language Switcher */}
            <div className="flex items-center border border-[#26262c] bg-[#111114] rounded-[1px] p-0.5 text-[11px] font-mono">
              {(['uz', 'ru', 'en'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLocale(l)}
                  className={cn(
                    'px-1.5 py-0.5 rounded-[1px] uppercase transition-colors',
                    locale === l
                      ? 'bg-[#a0a0b0] text-[#0b0b0d] font-bold'
                      : 'text-[#8b8b94] hover:text-[#d9d9de]'
                  )}
                  title={`Switch language to ${l.toUpperCase()}`}
                >
                  {l}
                </button>
              ))}
            </div>

            <button
              onClick={handleRandom}
              title={t('header.random')}
              className="hidden sm:flex h-9 w-9 items-center justify-center text-[#8b8b94] hover:text-[#d9d9de] hover:bg-[#17171b] rounded-[1px] transition-colors"
              aria-label={t('header.random')}
            >
              <Dices size={18} />
            </button>

            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 h-9 px-2.5 sm:px-3 text-[#8b8b94] hover:text-[#d9d9de] hover:bg-[#17171b] border border-transparent hover:border-[#26262c] rounded-[1px] transition-colors"
              aria-label={t('common.search')}
            >
              <Search size={16} />
              <span className="hidden sm:inline text-xs font-mono text-[#56565e]">
                {t('common.search')}...
              </span>
              <kbd className="hidden lg:inline text-[10px] font-mono bg-[#111114] border border-[#26262c] px-1 rounded text-[#56565e]">
                /
              </kbd>
            </button>

            {session?.user && <NotificationDropdown />}

            {session?.user ? (
              <UserMenu user={session.user} />
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login">
                  <Button size="sm" variant="ghost">
                    {t('header.sign_in')}
                  </Button>
                </Link>
                <Link href="/auth/register" className="hidden sm:inline-block">
                  <Button size="sm" variant="primary" clipCorner>
                    {t('header.register')}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-64 bg-[#0b0b0d] border-r border-[#26262c] h-full p-4 flex flex-col z-10">
            <div className="flex items-center justify-between pb-4 border-b border-[#26262c]">
              <span className="font-heading font-bold text-sm text-[#d9d9de]">ORVEN MEDIA</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-[#8b8b94] hover:text-[#d9d9de]"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="flex flex-col gap-1 py-4 flex-1 overflow-y-auto">
              {NAV_ITEMS.map((item) => {
                const labelKey = navKeyMap[item.href] || item.label
                const displayLabel = labelKey.startsWith('header.') ? t(labelKey) : item.label

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'px-3 py-2 text-sm rounded-[1px] transition-colors',
                      pathname === item.href
                        ? 'bg-[#17171b] text-[#a0a0b0] font-semibold'
                        : 'text-[#8b8b94] hover:text-[#d9d9de] hover:bg-[#111114]'
                    )}
                  >
                    {displayLabel}
                  </Link>
                )
              })}
            </nav>

            {/* Mobile Language Selector */}
            <div className="py-3 border-t border-[#26262c] flex items-center justify-between">
              <span className="text-xs font-mono text-[#8b8b94]">Language:</span>
              <div className="flex items-center border border-[#26262c] bg-[#111114] rounded-[1px] p-0.5 text-[11px] font-mono">
                {(['uz', 'ru', 'en'] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLocale(l)}
                    className={cn(
                      'px-2 py-0.5 rounded-[1px] uppercase transition-colors',
                      locale === l
                        ? 'bg-[#a0a0b0] text-[#0b0b0d] font-bold'
                        : 'text-[#8b8b94] hover:text-[#d9d9de]'
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {!session?.user && (
              <div className="pt-4 border-t border-[#26262c] flex flex-col gap-2">
                <Link href="/auth/login" className="w-full">
                  <Button variant="secondary" size="sm" fullWidth>
                    {t('header.sign_in')}
                  </Button>
                </Link>
                <Link href="/auth/register" className="w-full">
                  <Button variant="primary" size="sm" fullWidth>
                    {t('header.register')}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search Overlay */}
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}
