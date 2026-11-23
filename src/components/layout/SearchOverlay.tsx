'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Search, X, Clock, TrendingUp, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SearchSuggestion } from '@/types'

export interface SearchOverlayProps {
  isOpen: boolean
  onClose: () => void
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      const saved = localStorage.getItem('orven_recent_searches')
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved))
        } catch {}
      }
    } else {
      setQuery('')
      setSuggestions([])
    }
  }, [isOpen])

  // Global '/' keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !isOpen && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault()
        onClose() // toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Live search debounced
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setSuggestions(data.suggestions || [])
      } catch {
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [query])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    // Save recent search
    const updated = [query.trim(), ...recentSearches.filter((s) => s !== query.trim())].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('orven_recent_searches', JSON.stringify(updated))

    onClose()
    router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  const handleSelectRecent = (term: string) => {
    setQuery(term)
    onClose()
    router.push(`/search?q=${encodeURIComponent(term)}`)
  }

  const handleSelectSuggestion = (slug: string) => {
    onClose()
    router.push(`/anime/${slug}`)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-start pt-16 sm:pt-24 px-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-[#111114] border border-[#26262c] rounded-[2px] shadow-2xl overflow-hidden flex flex-col">
        {/* Search input form */}
        <form onSubmit={handleSearchSubmit} className="flex items-center px-4 h-14 border-b border-[#26262c]">
          <Search size={18} className="text-[#8b8b94] mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anime, donghua, movies..."
            className="flex-1 bg-transparent text-sm text-[#d9d9de] placeholder:text-[#56565e] focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-[#8b8b94] hover:text-[#d9d9de] p-1 mr-2"
            >
              <X size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-mono text-[#8b8b94] hover:text-[#d9d9de] px-2 py-1 bg-[#17171b] border border-[#26262c] rounded-[1px]"
          >
            ESC
          </button>
        </form>

        {/* Results / Suggestions / Recents */}
        <div className="max-h-[60vh] overflow-y-auto p-4 flex flex-col gap-4">
          {loading && (
            <div className="py-6 text-center text-xs text-[#8b8b94] font-mono">
              Searching database...
            </div>
          )}

          {!loading && suggestions.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8b8b94]">
                Results
              </span>
              <div className="flex flex-col gap-1">
                {suggestions.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectSuggestion(item.slug)}
                    className="flex items-center gap-3 p-2 hover:bg-[#17171b] border border-transparent hover:border-[#26262c] rounded-[1px] text-left transition-colors"
                  >
                    <div className="w-9 h-12 relative overflow-hidden bg-[#17171b] rounded-[1px] shrink-0 border border-[#26262c]">
                      {item.poster && (
                        <Image
                          src={item.poster}
                          alt={item.title}
                          fill
                          sizes="36px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-[#d9d9de] truncate">{item.title}</div>
                      {item.titleEnglish && (
                        <div className="text-[11px] text-[#8b8b94] truncate">{item.titleEnglish}</div>
                      )}
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono text-[#56565e]">
                        <span>{item.type}</span>
                        {item.year && <span>• {item.year}</span>}
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-[#56565e] shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {!loading && query.trim() && suggestions.length === 0 && (
            <div className="py-8 text-center text-xs text-[#8b8b94]">
              No anime found for &quot;<span className="text-[#d9d9de]">{query}</span>&quot;.
              <div className="mt-2">
                <button
                  onClick={handleSearchSubmit}
                  className="text-[#a0a0b0] hover:underline font-mono"
                >
                  View full search results &rarr;
                </button>
              </div>
            </div>
          )}

          {!query && recentSearches.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8b8b94] flex items-center gap-1.5">
                <Clock size={12} /> Recent searches
              </span>
              <div className="flex flex-wrap gap-1.5">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleSelectRecent(term)}
                    className="text-xs px-2.5 py-1 bg-[#17171b] border border-[#26262c] hover:border-[#a0a0b0]/40 text-[#8b8b94] hover:text-[#d9d9de] rounded-[1px] transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!query && (
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8b8b94] flex items-center gap-1.5">
                <TrendingUp size={12} /> Popular Searches
              </span>
              <div className="flex flex-wrap gap-1.5">
                {['Solo Leveling', 'Attack on Titan', 'Jujutsu Kaisen', 'Demon Slayer', 'Link Click', 'Soul Land', 'Frieren'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleSelectRecent(tag)}
                    className="text-xs px-2.5 py-1 bg-[#17171b] border border-[#26262c] hover:border-[#a0a0b0]/40 text-[#8b8b94] hover:text-[#d9d9de] rounded-[1px] transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
