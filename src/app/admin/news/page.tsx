'use client'

import React, { useState, useEffect } from 'react'
import { Newspaper, Plus, Trash2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { formatDate } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'

export default function AdminNewsPage() {
  const [news, setNews] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [image, setImage] = useState('')
  const [published, setPublished] = useState(true)
  const [loading, setLoading] = useState(false)
  const { success, error } = useToast()

  const fetchNews = async () => {
    try {
      const res = await fetch('/api/admin/news')
      if (res.ok) {
        const data = await res.json()
        setNews(data.news || [])
      }
    } catch {}
  }

  useEffect(() => {
    fetchNews()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/admin/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, image, published }),
      })

      if (res.ok) {
        success('News article published successfully!')
        setTitle('')
        setContent('')
        setImage('')
        setPublished(true)
        fetchNews()
      } else {
        const data = await res.json()
        error(data.error || 'Failed to publish news')
      }
    } catch {
      error('Error creating news')
    } finally {
      setLoading(false)
    }
  }

  const togglePublished = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/news', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, published: !currentStatus }),
      })

      if (res.ok) {
        success(`Article ${!currentStatus ? 'published' : 'hidden'}!`)
        fetchNews()
      } else {
        error('Failed to update article status')
      }
    } catch {
      error('Error updating status')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return

    try {
      const res = await fetch(`/api/admin/news?id=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        success('Article deleted successfully')
        fetchNews()
      } else {
        error('Failed to delete article')
      }
    } catch {
      error('Error deleting article')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 pb-4 border-b border-[#26262c]">
        <Newspaper size={20} className="text-[#a0a0b0]" />
        <div>
          <h1 className="text-lg font-bold font-heading text-[#d9d9de]">News & Articles</h1>
          <p className="text-xs text-[#8b8b94]">Create and manage platform news, blog posts, and release announcements.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Form */}
        <div className="p-5 bg-[#111114] border border-[#26262c] rounded-[2px] flex flex-col gap-4">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#d9d9de] flex items-center gap-2">
            <Plus size={14} className="text-[#a0a0b0]" /> Publish News
          </h2>

          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            <Input
              label="Article Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Fall 2024 Donghua Lineup Announced"
              required
            />

            <Input
              label="Cover Image URL (optional)"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://..."
            />

            <Textarea
              label="Content (Markdown / Plain Text)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write the full news content here..."
              rows={6}
              required
            />

            <label className="flex items-center gap-2 text-xs font-mono text-[#8b8b94] cursor-pointer">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="rounded-[1px] border-[#26262c] bg-[#17171b] text-[#a0a0b0]"
              />
              Publish immediately
            </label>

            <Button type="submit" variant="primary" loading={loading} className="w-full mt-2">
              Publish Article
            </Button>
          </form>
        </div>

        {/* News List */}
        <div className="lg:col-span-2 p-5 bg-[#111114] border border-[#26262c] rounded-[2px] flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#26262c]">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#d9d9de]">
              Published News ({news.length})
            </h2>
          </div>

          {news.length === 0 ? (
            <div className="py-12 text-center text-xs font-mono text-[#56565e]">
              No news articles published yet.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {news.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-[#17171b] border border-[#26262c] rounded-[2px] flex items-start justify-between gap-4"
                >
                  <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded-[1px] border ${
                          item.published
                            ? 'bg-[#3c8c5c]/10 text-[#3c8c5c] border-[#3c8c5c]/30'
                            : 'bg-[#56565e]/10 text-[#8b8b94] border-[#56565e]/30'
                        }`}
                      >
                        {item.published ? 'PUBLISHED' : 'DRAFT'}
                      </span>
                      <span className="text-[10px] font-mono text-[#56565e]">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-[#d9d9de]">{item.title}</h3>
                    <p className="text-xs text-[#8b8b94] line-clamp-2 leading-relaxed">
                      {item.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => togglePublished(item.id, item.published)}
                      title={item.published ? 'Hide article' : 'Publish article'}
                      className="p-1.5 text-[#8b8b94] hover:text-[#d9d9de] hover:bg-[#111114] rounded-[1px] transition-colors"
                    >
                      {item.published ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      title="Delete"
                      className="p-1.5 text-[#8b8b94] hover:text-[#c43c3c] hover:bg-[#111114] rounded-[1px] transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
