'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Save, ArrowLeft, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/Toast'
import { ANIME_TYPES, CATEGORIES, STATUSES, SEASONS } from '@/lib/constants'

export default function EditAnimePage() {
  const router = useRouter()
  const params = useParams()
  const animeId = params?.id as string
  const { success, error } = useToast()

  const [loading, setLoading] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  // Fields
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
  const [year, setYear] = useState('')
  const [totalEpisodes, setTotalEpisodes] = useState('')
  const [duration, setDuration] = useState('')
  const [averageScore, setAverageScore] = useState('')

  useEffect(() => {
    if (!animeId) return
    const fetchAnime = async () => {
      try {
        const res = await fetch(`/api/anime/${animeId}`)
        if (res.ok) {
          const { anime } = await res.json()
          setTitle(anime.title || '')
          setTitleEnglish(anime.titleEnglish || '')
          setTitleNative(anime.titleNative || '')
          setTitleRomaji(anime.titleRomaji || '')
          setSynopsis(anime.synopsis || '')
          setPoster(anime.poster || '')
          setBanner(anime.banner || '')
          setTrailer(anime.trailer || '')
          setType(anime.type || 'TV')
          setCategory(anime.category || 'ANIME')
          setStatus(anime.status || 'AIRING')
          setSeason(anime.season || 'WINTER')
          setYear(anime.year?.toString() || '')
          setTotalEpisodes(anime.totalEpisodes?.toString() || '')
          setDuration(anime.duration?.toString() || '')
          setAverageScore(anime.averageScore?.toString() || '')
        }
      } catch {}
    }
    fetchAnime()
  }, [animeId])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`/api/anime/${animeId}`, {
        method: 'PUT',
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

      if (res.ok) {
        success('Anime updated successfully!')
        router.push('/admin/anime')
      } else {
        error('Failed to update anime')
      }
    } catch {
      error('Error updating anime')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/anime/${animeId}`, { method: 'DELETE' })
      if (res.ok) {
        success('Anime deleted successfully')
        router.push('/admin/anime')
      } else {
        error('Failed to delete anime')
      }
    } catch {
      error('Error deleting anime')
    }
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#26262c]">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()} icon={<ArrowLeft size={16} />}>
            Back
          </Button>
          <h1 className="text-xl font-bold font-heading text-[#d9d9de]">Edit: {title}</h1>
        </div>

        <Button variant="danger" size="sm" onClick={() => setDeleteModalOpen(true)} icon={<Trash2 size={15} />}>
          Delete Title
        </Button>
      </div>

      <form onSubmit={handleUpdate} className="p-6 bg-[#111114] border border-[#26262c] rounded-[2px] flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Primary Title" required value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input label="English Title" value={titleEnglish} onChange={(e) => setTitleEnglish(e.target.value)} />
          <Input label="Native Title" value={titleNative} onChange={(e) => setTitleNative(e.target.value)} />
          <Input label="Romaji Title" value={titleRomaji} onChange={(e) => setTitleRomaji(e.target.value)} />
        </div>

        <Textarea label="Synopsis" value={synopsis} onChange={(e) => setSynopsis(e.target.value)} className="min-h-[120px]" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input label="Poster URL" value={poster} onChange={(e) => setPoster(e.target.value)} />
          <Input label="Banner URL" value={banner} onChange={(e) => setBanner(e.target.value)} />
          <Input label="Trailer (YouTube)" value={trailer} onChange={(e) => setTrailer(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Select label="Format" value={type} options={ANIME_TYPES.map((t) => ({ value: t, label: t }))} onChange={(v) => setType(v as string)} />
          <Select label="Category" value={category} options={CATEGORIES.map((c) => ({ value: c, label: c }))} onChange={(v) => setCategory(v as string)} />
          <Select label="Status" value={status} options={STATUSES.map((s) => ({ value: s, label: s }))} onChange={(v) => setStatus(v as string)} />
          <Select label="Season" value={season} options={SEASONS.map((s) => ({ value: s, label: s }))} onChange={(v) => setSeason(v as string)} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Input label="Year" type="number" value={year} onChange={(e) => setYear(e.target.value)} />
          <Input label="Total Episodes" type="number" value={totalEpisodes} onChange={(e) => setTotalEpisodes(e.target.value)} />
          <Input label="Duration" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
          <Input label="Average Score" type="number" value={averageScore} onChange={(e) => setAverageScore(e.target.value)} />
        </div>

        <div className="flex justify-end pt-4 border-t border-[#26262c]">
          <Button type="submit" variant="primary" size="lg" loading={loading} clipCorner icon={<Save size={16} />}>
            Save Changes
          </Button>
        </div>
      </form>

      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Anime?"
        description="All episodes, comments, and history associated with this anime will also be deleted."
        confirmText="Yes, delete permanently"
        variant="danger"
      />
    </div>
  )
}
