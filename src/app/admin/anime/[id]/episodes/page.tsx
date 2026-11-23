'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Plus, ArrowLeft, Video, Upload, Check, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FileUpload } from '@/components/ui/FileUpload'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import type { EpisodeItem } from '@/types'

export default function AdminEpisodesPage() {
  const params = useParams()
  const router = useRouter()
  const animeId = params?.id as string
  const { success, error } = useToast()

  const [animeTitle, setAnimeTitle] = useState('')
  const [episodes, setEpisodes] = useState<EpisodeItem[]>([])
  const [loading, setLoading] = useState(true)

  // Add episode modal
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [number, setNumber] = useState('')
  const [title, setTitle] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [videoType, setVideoType] = useState('mp4')
  const [introStart, setIntroStart] = useState('')
  const [introEnd, setIntroEnd] = useState('')
  const [outroStart, setOutroStart] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchAnimeData = async () => {
    try {
      const res = await fetch(`/api/anime/${animeId}`)
      if (res.ok) {
        const { anime } = await res.json()
        setAnimeTitle(anime.title)
        setEpisodes(anime.episodes || [])
        // Auto suggest next episode number
        const nextNum = (anime.episodes?.length || 0) + 1
        setNumber(nextNum.toString())
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (animeId) fetchAnimeData()
  }, [animeId])

  const handleSaveEpisode = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch(`/api/anime/${animeId}/episodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: parseInt(number),
          title: title || undefined,
          videoUrl: videoUrl || undefined,
          videoType,
          introStart: introStart ? parseInt(introStart) : undefined,
          introEnd: introEnd ? parseInt(introEnd) : undefined,
          outroStart: outroStart ? parseInt(outroStart) : undefined,
        }),
      })

      if (res.ok) {
        success(`Episode ${number} saved!`)
        setAddModalOpen(false)
        setTitle('')
        setVideoUrl('')
        fetchAnimeData()
      } else {
        const err = await res.json()
        error(err.error || 'Failed to save episode')
      }
    } catch {
      error('Error saving episode')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#26262c]">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/admin/anime')} icon={<ArrowLeft size={16} />}>
            Back
          </Button>
          <div>
            <h1 className="text-xl font-bold font-heading text-[#d9d9de]">
              Manage Episodes: {animeTitle}
            </h1>
            <span className="text-xs font-mono text-[#8b8b94]">{episodes.length} episodes added</span>
          </div>
        </div>

        <Button variant="primary" size="sm" clipCorner onClick={() => setAddModalOpen(true)} icon={<Plus size={15} />}>
          Add Episode
        </Button>
      </div>

      {/* Episodes Table */}
      <div className="bg-[#111114] border border-[#26262c] rounded-[2px] overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#17171b] border-b border-[#26262c] text-[#8b8b94] font-mono uppercase text-[10px]">
              <th className="p-3">#</th>
              <th className="p-3">Episode Title</th>
              <th className="p-3">Video Source</th>
              <th className="p-3">Format</th>
              <th className="p-3">Timestamps</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#26262c]">
            {episodes.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-[#56565e] font-mono">
                  No episodes uploaded yet. Click &quot;Add Episode&quot; above.
                </td>
              </tr>
            ) : (
              episodes.map((ep) => (
                <tr key={ep.id} className="hover:bg-[#17171b]/50">
                  <td className="p-3 font-mono font-bold text-[#a0a0b0]">EP {ep.number}</td>
                  <td className="p-3 font-medium text-[#d9d9de]">{ep.title || '-'}</td>
                  <td className="p-3 font-mono text-[11px] text-[#8b8b94] truncate max-w-xs">
                    {ep.videoUrl || 'Default open test stream'}
                  </td>
                  <td className="p-3 font-mono uppercase text-[10px] text-[#a0a0b0]">{ep.videoType}</td>
                  <td className="p-3 font-mono text-[10px] text-[#56565e]">
                    {ep.introStart && ep.introEnd ? `Intro: ${ep.introStart}-${ep.introEnd}s` : '-'}
                  </td>
                  <td className="p-3 text-right">
                    <span className="text-[10px] font-mono text-[#3c8c5c] bg-[#3c8c5c]/10 border border-[#3c8c5c]/30 px-2 py-0.5 rounded-[1px]">
                      Ready
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Episode Modal */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add Episode" maxWidth="md">
        <form onSubmit={handleSaveEpisode} className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Episode Number"
              type="number"
              required
              value={number}
              onChange={(e) => setNumber(e.target.value)}
            />
            <div className="col-span-2">
              <Input
                label="Episode Title (Optional)"
                placeholder="e.g. I\'m Used to It"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          <Input
            label="Video Stream URL (MP4 or HLS .m3u8)"
            placeholder="https://.../video.m3u8 or https://.../video.mp4"
            value={videoUrl}
            onChange={(e) => {
              setVideoUrl(e.target.value)
              if (e.target.value.includes('.m3u8')) setVideoType('hls')
              else setVideoType('mp4')
            }}
            hint="Leave blank to use default open test video stream."
          />

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Intro Start (sec)"
              type="number"
              placeholder="e.g. 90"
              value={introStart}
              onChange={(e) => setIntroStart(e.target.value)}
            />
            <Input
              label="Intro End (sec)"
              type="number"
              placeholder="e.g. 180"
              value={introEnd}
              onChange={(e) => setIntroEnd(e.target.value)}
            />
            <Input
              label="Outro Start (sec)"
              type="number"
              placeholder="e.g. 1320"
              value={outroStart}
              onChange={(e) => setOutroStart(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#26262c]">
            <Button type="button" variant="secondary" size="sm" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={saving} clipCorner>
              Save Episode
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
