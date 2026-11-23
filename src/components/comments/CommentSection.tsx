'use client'

import React, { useState, useEffect } from 'react'
import { MessageSquare, ArrowUpDown } from 'lucide-react'
import { CommentForm } from './CommentForm'
import { CommentItem } from './CommentItem'
import type { CommentItem as CommentItemType } from '@/types'
import { useSession } from 'next-auth/react'
import { useToast } from '@/components/ui/Toast'
import Link from 'next/link'

export interface CommentSectionProps {
  animeId?: string
  episodeId?: string
}

export const CommentSection: React.FC<CommentSectionProps> = ({ animeId, episodeId }) => {
  const [comments, setComments] = useState<CommentItemType[]>([])
  const [totalComments, setTotalComments] = useState(0)
  const [sort, setSort] = useState<'newest' | 'oldest' | 'top'>('newest')
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()
  const { success, error } = useToast()

  const fetchComments = async () => {
    try {
      const params = new URLSearchParams()
      if (animeId) params.set('animeId', animeId)
      if (episodeId) params.set('episodeId', episodeId)
      params.set('sort', sort)

      const res = await fetch(`/api/comments?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setComments(data.comments || [])
        setTotalComments(data.total || 0)
      }
    } catch {
      // Error fetching
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [animeId, episodeId, sort])

  const handleCreateComment = async (content: string, isSpoiler: boolean) => {
    if (!session?.user) {
      error('Please sign in to comment')
      return false
    }

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ animeId, episodeId, content, isSpoiler }),
      })

      if (res.ok) {
        success('Comment posted successfully')
        fetchComments()
        return true
      } else {
        const err = await res.json()
        error(err.error || 'Failed to post comment')
        return false
      }
    } catch {
      error('Network error')
      return false
    }
  }

  const handleReply = async (parentId: string, content: string, isSpoiler: boolean) => {
    if (!session?.user) {
      error('Please sign in to reply')
      return false
    }

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ animeId, episodeId, parentId, content, isSpoiler }),
      })

      if (res.ok) {
        success('Reply posted')
        fetchComments()
        return true
      }
      return false
    } catch {
      return false
    }
  }

  const handleLike = async (commentId: string, isLike: boolean) => {
    try {
      const res = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLike }),
      })
      if (res.ok) {
        fetchComments()
      }
    } catch {}
  }

  const handleDelete = async (commentId: string) => {
    try {
      const res = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' })
      if (res.ok) {
        success('Comment deleted')
        fetchComments()
      }
    } catch {}
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header & Sorter */}
      <div className="flex items-center justify-between pb-2 border-b border-[#26262c]">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-[#a0a0b0]" />
          <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-[#d9d9de]">
            Discussion ({totalComments})
          </h3>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono text-[#8b8b94]">
          <ArrowUpDown size={12} />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="bg-transparent text-[#d9d9de] focus:outline-none cursor-pointer"
          >
            <option value="newest" className="bg-[#17171b]">Newest</option>
            <option value="top" className="bg-[#17171b]">Most Liked</option>
            <option value="oldest" className="bg-[#17171b]">Oldest</option>
          </select>
        </div>
      </div>

      {/* Main Comment Input */}
      {session?.user ? (
        <CommentForm onSubmit={handleCreateComment} />
      ) : (
        <div className="p-4 bg-[#111114] border border-[#26262c] rounded-[2px] text-center text-xs text-[#8b8b94]">
          <Link href="/auth/login" className="text-[#a0a0b0] hover:underline font-bold">
            Sign in
          </Link>{' '}
          to join the discussion and share your thoughts.
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="py-8 text-center text-xs font-mono text-[#56565e]">
          Loading comments...
        </div>
      ) : comments.length === 0 ? (
        <div className="py-8 text-center text-xs font-mono text-[#56565e]">
          No comments yet. Be the first to leave a comment!
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              onLike={handleLike}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
