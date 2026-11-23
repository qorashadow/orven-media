'use client'

import React, { useState } from 'react'
import { Share2, Copy, Check, Send } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dropdown, type DropdownItem } from '@/components/ui/Dropdown'
import { useToast } from '@/components/ui/Toast'

const XIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

export interface ShareButtonProps {
  title: string
  url?: string
  className?: string
}

export const ShareButton: React.FC<ShareButtonProps> = ({ title, url, className }) => {
  const [copied, setCopied] = useState(false)
  const { success } = useToast()

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')

  const handleCopy = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShareTwitter = () => {
    const tweetText = encodeURIComponent(`Watch ${title} on Orven Media: ${shareUrl}`)
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank')
  }

  const handleShareTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`, '_blank')
  }

  const items: DropdownItem[] = [
    {
      label: copied ? 'Copied!' : 'Copy Link',
      icon: copied ? <Check size={14} className="text-[#3c8c5c]" /> : <Copy size={14} />,
      onClick: handleCopy,
    },
    {
      label: 'Share on X / Twitter',
      icon: <XIcon size={14} />,
      onClick: handleShareTwitter,
    },
    {
      label: 'Share on Telegram',
      icon: <Send size={14} />,
      onClick: handleShareTelegram,
    },
  ]

  return (
    <Dropdown
      trigger={
        <Button variant="secondary" size="md" icon={<Share2 size={15} />} className={className}>
          Share
        </Button>
      }
      items={items}
      width="w-48"
    />
  )
}
