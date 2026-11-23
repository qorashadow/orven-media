'use client'

import React, { useState, useEffect } from 'react'
import { Star, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { useToast } from '@/components/ui/Toast'

export default function AdminSpotlightPage() {
  const [spotlights, setSpotlights] = useState<any[]>([])
  const [animeOptions, setAnimeOptions] = useState<any[]>([])
  const [selectedAnimeId, setSelectedAnimeId] = useState('')
  const [loading, setLoading] = useState(true)
  const { success, error } = useToast()

  const fetchSpotlights = async () => {
    try {
      const res = await fetch('/api/admin/spotlight')
      if (res.ok) {
        const data = await res.json()
        setSpotlights(data.spotlights || [])
      }
      const animeRes = await fetch('/api/anime?limit=50')
      if (animeRes.ok) {
        const data = await animeRes.json()
        setAnimeOptions(data.items || [])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSpotlights()
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAnimeId) return

    try {
      const res = await fetch('/api/admin/spotlight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ animeId: selectedAnimeId, order: spotlights.length + 1 }),
      })
      if (res.ok) {
        success('Added to spotlight!')
        setSelectedAnimeId('')
        fetchSpotlights()
      }
    } catch {
      error('Failed to add spotlight')
    }
  }

  const handleRemove = async (animeId: string) => {
    try {
      const res = await fetch(`/api/admin/spotlight?animeId=${animeId}`, { method: 'DELETE' })
      if (res.ok) {
        success('Removed from spotlight')
        fetchSpotlights()
      }
    } catch {
      error('Failed to remove')
    }
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <div className="pb-4 border-b border-[#26262c]">
        <h1 className="text-xl sm:text-2xl font-bold font-heading text-[#d9d9de]">
          Hero Spotlight Slider Management
        </h1>
        <p className="text-xs text-[#8b8b94] mt-0.5">
          Choose which anime/donghua titles appear in the prominent homepage banner.
        </p>
      </div>

      {/* Add to spotlight form */}
      <form onSubmit={handleAdd} className="p-4 bg-[#111114] border border-[#26262c] rounded-[2px] flex flex-col sm:flex-row gap-3 items-end">
        <div className="flex-1 w-full">
          <Select
            label="Select Anime to Feature"
            placeholder="Choose an anime title..."
            value={selectedAnimeId}
            options={animeOptions.map((a) => ({ value: a.id, label: `${a.title} (${a.type})` }))}
            onChange={(v) => setSelectedAnimeId(v as string)}
          />
        </div>
        <Button type="submit" variant="primary" size="md" clipCorner icon={<Plus size={15} />}>
          Add to Spotlight
        </Button>
      </form>

      {/* Spotlight list */}
      <div className="bg-[#111114] border border-[#26262c] rounded-[2px] overflow-hidden">
        <div className="p-3 bg-[#17171b] border-b border-[#26262c] text-xs font-mono font-bold uppercase text-[#8b8b94]">
          Featured Titles ({spotlights.length})
        </div>

        <div className="divide-y divide-[#26262c]">
          {spotlights.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-[#56565e]">
              No spotlight titles selected.
            </div>
          ) : (
            spotlights.map((item, index) => (
              <div key={item.id} className="p-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#17171b] border border-[#26262c] flex items-center justify-center font-mono font-bold text-xs text-[#a0a0b0]">
                    {index + 1}
                  </span>
                  <span className="text-xs font-semibold text-[#d9d9de]">{item.title}</span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(item.id)}
                  className="text-[#c43c3c] hover:bg-[#c43c3c]/10"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
