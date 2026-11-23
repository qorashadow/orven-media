'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DownloadCloud, Save, ArrowLeft, Search, Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { ANIME_TYPES, CATEGORIES, STATUSES, SEASONS } from '@/lib/constants'
import Image from 'next/image'

export default function NewAnimePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const autoOpenImport = searchParams.get('import') === 'true'
  const { success, error } = useToast()

  const [loading, setLoading] = useState(false)
  const [importModalOpen, setImportModalOpen] = useState(autoOpenImport)
  const [importQuery, setImportQuery] = useState('')
  const [importResults, setImportResults] = useState<any[]>([])
  const [importLoading, setImportLoading] = useState(false)
  const [importingId, setImportingId] = useState<number | null>(null)

  // Form Fields
  const [title, setTitle] = useState('')
  const [titleEnglish, setTitleEnglish] = useState('')
  const [titleNative, setTitleNative] = useState('')
  const [titleRomaji, setTitleRomaji] = useState('')
  const [synopsis, setSynopsis] = useState('')
  const [poster, setPoster] = useState('')
  const [banner, setBanner] = useState('')
  const [trailer, setTrailer] = useState('')
  const [type, setType] = useState('TV')
  const [category, setCategory] = useState('ANIME')
  const [status, setStatus] = useState('AIRING')
  const [season, setSeason] = useState('WINTER')
  const [year, setYear] = useState(new Date().getFullYear().toString())
  const [totalEpisodes, setTotalEpisodes] = useState('')
  const [duration, setDuration] = useState('24')
  const [averageScore, setAverageScore] = useState('80')

  // AniList Search handler
  const handleAniListSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!importQuery.trim()) return

    setImportLoading(true)
    try {
      const res = await fetch('/api/anime/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: importQuery.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        setImportResults(data.results || [])
      } else {
        error(data.error || 'Search failed')
      }
    } catch {
      error('Failed to query AniList')
    } finally {
      setImportLoading(false)
    }
  }

  // Confirm import and auto-save
  const handleConfirmImport = async (item: any) => {
    setImportingId(item.id)
    try {
      const res = await fetch('/api/anime/import/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anilistId: item.id }),
      })

      const data = await res.json()
      if (res.ok) {
        success(`Successfully imported "${item.title.romaji || item.title.english}"!`)
        setImportModalOpen(false)
        router.push(`/admin/anime/${data.anime.id}/episodes`)
      } else {
        error(data.error || 'Import failed')
      }
    } catch {
      error('Error importing anime')
    } finally {
      setImportingId(null)
    }
  }

  // Manual save handler
  const handleManualSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/anime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          titleEnglish,
          titleNative,
          titleRomaji,
          synopsis,
          poster,
          banner,
          trailer,
          type,
          category,
          status,
          season,
          year: year ? parseInt(year) : undefined,
          totalEpisodes: totalEpisodes ? parseInt(totalEpisodes) : undefined,
          duration: duration ? parseInt(duration) : undefined,
          averageScore: averageScore ? parseFloat(averageScore) : undefined,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        success('Anime created successfully!')
        router.push(`/admin/anime/${data.anime.id}/episodes`)
      } else {
        error(data.error || 'Failed to create anime')
      }
    } catch {
      error('Error saving anime')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#26262c]">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()} icon={<ArrowLeft size={16} />}>
            Back
          </Button>
          <h1 className="text-xl font-bold font-heading text-[#d9d9de]">Add New Title</h1>
        </div>

        <Button
          variant="primary"
          size="sm"
          clipCorner
          onClick={() => setImportModalOpen(true)}
          icon={<DownloadCloud size={15} />}
        >
          Import from AniList
        </Button>
      </div>

      {/* Manual Form */}
      <form onSubmit={handleManualSave} className="p-6 bg-[#111114] border border-[#26262c] rounded-[2px] flex flex-col gap-5">
        <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-[#d9d9de] pb-2 border-b border-[#26262c]">
          Title & Basic Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Primary Title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Solo Leveling"
          />
          <Input
            label="English Title"
            value={titleEnglish}
            onChange={(e) => setTitleEnglish(e.target.value)}
            placeholder="e.g. Solo Leveling"
          />
          <Input
            label="Native Title"
            value={titleNative}
            onChange={(e) => setTitleNative(e.target.value)}
            placeholder="e.g. 나 혼자만 레벨업"
          />
          <Input
            label="Romaji Title"
            value={titleRomaji}
            onChange={(e) => setTitleRomaji(e.target.value)}
            placeholder="e.g. Na Honjaman Rebeleop"
          />
        </div>

        <Textarea
          label="Synopsis / Description"
          value={synopsis}
          onChange={(e) => setSynopsis(e.target.value)}
          placeholder="Story overview..."
          className="min-h-[120px]"
        />

        <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-[#d9d9de] pt-2 pb-2 border-b border-[#26262c]">
          Media Assets & Links
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Poster Image URL"
            value={poster}
            onChange={(e) => setPoster(e.target.value)}
            placeholder="https://..."
          />
          <Input
            label="Banner Image URL"
            value={banner}
            onChange={(e) => setBanner(e.target.value)}
            placeholder="https://..."
          />
          <Input
            label="Trailer URL (YouTube)"
            value={trailer}
            onChange={(e) => setTrailer(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>

        <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-[#d9d9de] pt-2 pb-2 border-b border-[#26262c]">
          Format, Category & Status
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Select
            label="Format"
            value={type}
            options={ANIME_TYPES.map((t) => ({ value: t, label: t }))}
            onChange={(v) => setType(v as string)}
          />
          <Select
            label="Category"
            value={category}
            options={CATEGORIES.map((c) => ({ value: c, label: c }))}
            onChange={(v) => setCategory(v as string)}
          />
          <Select
            label="Status"
            value={status}
            options={STATUSES.map((s) => ({ value: s, label: s }))}
            onChange={(v) => setStatus(v as string)}
          />
          <Select
            label="Season"
            value={season}
            options={SEASONS.map((s) => ({ value: s, label: s }))}
            onChange={(v) => setSeason(v as string)}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Input
            label="Release Year"
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
          <Input
            label="Total Episodes"
            type="number"
            value={totalEpisodes}
            onChange={(e) => setTotalEpisodes(e.target.value)}
            placeholder="12"
          />
          <Input
            label="Duration (min/ep)"
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
          <Input
            label="Average Score (0-100)"
            type="number"
            value={averageScore}
            onChange={(e) => setAverageScore(e.target.value)}
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-[#26262c]">
          <Button type="submit" variant="primary" size="lg" loading={loading} clipCorner icon={<Save size={16} />}>
            Create Anime
          </Button>
        </div>
      </form>

      {/* AniList Search Modal */}
      <Modal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        title="Import Anime / Donghua from AniList"
        maxWidth="lg"
      >
        <div className="flex flex-col gap-4">
          <form onSubmit={handleAniListSearch} className="flex gap-2">
            <Input
              value={importQuery}
              onChange={(e) => setImportQuery(e.target.value)}
              placeholder="Search by title (e.g. Solo Leveling, Link Click)..."
              autoFocus
            />
            <Button type="submit" variant="primary" loading={importLoading} icon={<Search size={14} />}>
              Search
            </Button>
          </form>

          {/* Results list */}
          <div className="max-h-[400px] overflow-y-auto flex flex-col gap-2">
            {importResults.length === 0 && !importLoading && (
              <div className="py-12 text-center text-xs font-mono text-[#56565e]">
                Type a name above and click search.
              </div>
            )}

            {importResults.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-[#17171b] border border-[#26262c] rounded-[1px] gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-10 h-14 bg-[#111114] rounded-[1px] overflow-hidden shrink-0 border border-[#26262c]">
                    {item.coverImage?.large && (
                      <Image
                        src={item.coverImage.large}
                        alt="Cover"
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-[#d9d9de] truncate">
                      {item.title.romaji || item.title.english}
                    </h4>
                    <span className="text-[10px] text-[#8b8b94] truncate block">
                      {item.title.english || item.title.native}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-[#56565e] mt-1">
                      <span>{item.format}</span>
                      <span>• {item.episodes || '?'} EPS</span>
                      {item.seasonYear && <span>• {item.seasonYear}</span>}
                    </div>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  loading={importingId === item.id}
                  onClick={() => handleConfirmImport(item)}
                  icon={<Sparkles size={13} />}
                >
                  Import
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  )
}
