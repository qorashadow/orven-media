'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ThumbsUp, ThumbsDown, MessageSquare, AlertTriangle, Eye, EyeOff, MoreVertical } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Dropdown } from '@/components/ui/Dropdown'
import { CommentForm } from './CommentForm'
import { formatTimeAgo, cn } from '@/lib/utils'
import type { CommentItem as CommentItemType } from '@/types'
import { useSession } from 'next-auth/react'
import { useToast } from '@/components/ui/Toast'

export interface CommentItemProps {
  comment: CommentItemType
  onReply: (parentId: string, content: string, isSpoiler: boolean) => Promise<boolean>
  onLike: (commentId: string, isLike: boolean) => Promise<void>
  onDelete?: (commentId: string) => Promise<void>
  onReport?: (commentId: string) => void
  depth?: number
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onReply,
  onLike,
  onDelete,
  onReport,
  depth = 0,
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [revealedSpoiler, setRevealedSpoiler] = useState(!comment.isSpoiler)
  const { data: session } = useSession()
  const { error } = useToast()

  const isOwn = session?.user?.id === comment.user.id
  const isAdmin = session?.user?.role === 'ADMIN'

  const handleLike = (isLike: boolean) => {
    if (!session?.user) {
      error('Please sign in to rate comments')
      return
    }
    onLike(comment.id, isLike)
  }

  const dropdownItems = [
    ...(isOwn || isAdmin
      ? [
          {
            label: 'Delete comment',
            danger: true,
            onClick: () => onDelete?.(comment.id),
          },
        ]
      : []),
    {
      label: 'Report comment',
      onClick: () => onReport?.(comment.id),
    },
  ]

  return (
    <div className={cn('flex flex-col gap-2', depth > 0 && 'ml-4 sm:ml-8 pl-3 border-l border-[#26262c]')}>
      <div className="flex items-start gap-3 p-3 bg-[#111114] border border-[#26262c] rounded-[2px]">
        {/* User Avatar */}
        <Link href={`/profile/${comment.user.username}`}>
          <Avatar
            src={comment.user.avatar}
            alt={comment.user.username}
            fallback={comment.user.username}
            size="sm"
          />
        </Link>

        {/* Content & Actions */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Link
                href={`/profile/${comment.user.username}`}
                className="text-xs font-semibold text-[#d9d9de] hover:text-[#a0a0b0] transition-colors"
              >
                {comment.user.username}
              </Link>
              <span className="text-[10px] font-mono text-[#56565e]">
                {formatTimeAgo(comment.createdAt)}
              </span>
              {comment.isEdited && (
                <span className="text-[9px] font-mono text-[#56565e]">(edited)</span>
              )}
            </div>

            <Dropdown
              trigger={
                <button className="text-[#56565e] hover:text-[#d9d9de] p-1">
                  <MoreVertical size={14} />
                </button>
              }
              items={dropdownItems}
              width="w-36"
            />
          </div>

          {/* Comment text or Spoiler warning */}
          <div className="mt-1 text-xs text-[#d9d9de] leading-relaxed">
            {comment.isSpoiler && !revealedSpoiler ? (
              <div
                onClick={() => setRevealedSpoiler(true)}
                className="p-2 bg-[#17171b] border border-[#26262c] rounded-[1px] text-[#8b8b94] cursor-pointer hover:text-[#d9d9de] flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5 font-mono text-[11px] text-[#b8942c]">
                  <EyeOff size={13} /> Spoiler comment
                </span>
                <span className="text-[10px] text-[#56565e] underline">Click to reveal</span>
              </div>
            ) : (
              <p className="whitespace-pre-wrap break-words">{comment.content}</p>
            )}
          </div>

          {/* Interactions */}
          <div className="flex items-center gap-4 mt-2.5 pt-1.5 border-t border-[#17171b] text-[11px] font-mono text-[#8b8b94]">
            {/* Likes */}
            <button
              onClick={() => handleLike(true)}
              className={cn(
                'flex items-center gap-1 transition-colors',
                comment.userLike?.isLike === true ? 'text-[#3c8c5c] font-bold' : 'hover:text-[#d9d9de]'
              )}
            >
              <ThumbsUp size={13} />
              <span>{comment.likesCount}</span>
            </button>

            {/* Dislikes */}
            <button
              onClick={() => handleLike(false)}
              className={cn(
                'flex items-center gap-1 transition-colors',
                comment.userLike?.isLike === false ? 'text-[#c43c3c] font-bold' : 'hover:text-[#d9d9de]'
              )}
            >
              <ThumbsDown size={13} />
              <span>{comment.dislikesCount}</span>
            </button>

            {/* Reply toggle */}
            {depth < 2 && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center gap-1 hover:text-[#d9d9de] transition-colors"
              >
                <MessageSquare size={13} />
                <span>Reply</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Inline Reply Form */}
      {showReplyForm && (
        <div className="ml-8 mt-1">
          <CommentForm
            placeholder={`Replying to @${comment.user.username}...`}
            buttonText="Send Reply"
            onCancel={() => setShowReplyForm(false)}
            onSubmit={async (content, isSpoiler) => {
              const ok = await onReply(comment.id, content, isSpoiler)
              if (ok) setShowReplyForm(false)
              return ok
            }}
          />
        </div>
      )}

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="flex flex-col gap-2 mt-1">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onLike={onLike}
              onDelete={onDelete}
              onReport={onReport}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
