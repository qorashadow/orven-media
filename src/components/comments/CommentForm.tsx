'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Toggle } from '@/components/ui/Toggle'
import { EyeOff } from 'lucide-react'

export interface CommentFormProps {
  onSubmit: (content: string, isSpoiler: boolean) => Promise<boolean>
  onCancel?: () => void
  placeholder?: string
  buttonText?: string
  initialContent?: string
  initialSpoiler?: boolean
}

export const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  onCancel,
  placeholder = 'Write a respectful comment...',
  buttonText = 'Post Comment',
  initialContent = '',
  initialSpoiler = false,
}) => {
  const [content, setContent] = useState(initialContent)
  const [isSpoiler, setIsSpoiler] = useState(initialSpoiler)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || loading) return

    setLoading(true)
    const success = await onSubmit(content.trim(), isSpoiler)
    setLoading(false)

    if (success) {
      setContent('')
      setIsSpoiler(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 bg-[#111114] border border-[#26262c] p-3 rounded-[2px]">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        maxLength={2000}
        showCount
        required
        className="min-h-[80px]"
      />

      <div className="flex items-center justify-between gap-3 pt-1">
        <label className="flex items-center gap-1.5 text-xs text-[#8b8b94] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isSpoiler}
            onChange={(e) => setIsSpoiler(e.target.checked)}
            className="rounded-[1px] accent-[#a0a0b0]"
          />
          <EyeOff size={13} className="text-[#8b8b94]" />
          <span>Mark as spoiler</span>
        </label>

        <div className="flex items-center gap-2">
          {onCancel && (
            <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" variant="primary" size="sm" loading={loading} disabled={!content.trim()}>
            {buttonText}
          </Button>
        </div>
      </div>
    </form>
  )
}
