'use client'

import React, { useState } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useSession } from 'next-auth/react'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'

export interface FavoriteButtonProps {
  animeId: string
  initialFavorited?: boolean
  className?: string
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  animeId,
  initialFavorited = false,
  className,
}) => {
  const [isFavorited, setIsFavorited] = useState(initialFavorited)
  const [loading, setLoading] = useState(false)
  const { data: session } = useSession()
  const { success, error } = useToast()

  const handleToggle = async () => {
    if (!session?.user) {
      error('Please sign in to add favorites')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ animeId }),
      })

      if (res.ok) {
        const data = await res.json()
        setIsFavorited(data.favorited)
        success(data.favorited ? 'Added to favorites' : 'Removed from favorites')
      }
    } catch {
      error('Failed to update favorite')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="secondary"
      size="md"
      loading={loading}
      onClick={handleToggle}
      className={cn(className, isFavorited && 'text-[#c43c3c] border-[#c43c3c]/40')}
      icon={
        <Heart
          size={15}
          className={cn('transition-transform', isFavorited && 'fill-[#c43c3c] text-[#c43c3c] scale-110')}
        />
      }
    >
      {isFavorited ? 'Favorited' : 'Favorite'}
    </Button>
  )
}
