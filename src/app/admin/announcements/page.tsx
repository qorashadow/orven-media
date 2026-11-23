'use client'

import React, { useState, useEffect } from 'react'
import { Megaphone, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { formatDate } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [type, setType] = useState('INFO')
  const [loading, setLoading] = useState(false)
  const { success, error } = useToast()

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/admin/announcements')
      if (res.ok) {
        const data = await res.json()
        setAnnouncements(data.announcements || [])
      }
    } catch {}
  }

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, type }),
      })

      if (res.ok) {
        success('Announcement published!')
        setTitle('')
        setContent('')
        fetchAnnouncements()
      } else {
        error('Failed to create announcement')
      }
    } catch {
      error('Error creating announcement')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/announcements?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        success('Announcement deleted')
        fetchAnnouncements()
      }
    } catch {
      error('Failed to delete')
    }
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <div className="pb-4 border-b border-[#26262c]">
        <h1 className="text-xl sm:text-2xl font-bold font-heading text-[#d9d9de]">
          Site Announcements
        </h1>
        <p className="text-xs text-[#8b8b94] mt-0.5">
          Broadcast banners displayed at the top of the homepage for all users.
        </p>
      </div>

      <form onSubmit={handleCreate} className="p-4 bg-[#111114] border border-[#26262c] rounded-[2px] flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <Input label="Title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="System Update" />
          </div>
          <Select
            label="Type"
            value={type}
            options={[
              { value: 'INFO', label: 'Info' },
              { value: 'WARNING', label: 'Warning' },
              { value: 'EVENT', label: 'Event' },
            ]}
            onChange={(v) => setType(v as string)}
          />
        </div>

        <Textarea label="Content message" required value={content} onChange={(e) => setContent(e.target.value)} placeholder="Server migration complete..." />

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="sm" loading={loading} clipCorner icon={<Plus size={14} />}>
            Publish Announcement
          </Button>
        </div>
      </form>

      <div className="bg-[#111114] border border-[#26262c] rounded-[2px] overflow-hidden divide-y divide-[#26262c]">
        {announcements.map((a) => (
          <div key={a.id} className="p-3.5 flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs text-[#d9d9de]">{a.title}</span>
                <span className="text-[9px] font-mono uppercase bg-[#17171b] border border-[#26262c] px-1 rounded-[1px]">
                  {a.type}
                </span>
                <span className="text-[10px] font-mono text-[#56565e]">{formatDate(a.createdAt)}</span>
              </div>
              <p className="text-xs text-[#8b8b94]">{a.content}</p>
            </div>

            <Button variant="ghost" size="sm" onClick={() => handleDelete(a.id)} className="text-[#c43c3c]">
              <Trash2 size={14} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
