import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export interface AvatarProps {
  src?: string | null
  alt?: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  status?: 'online' | 'offline' | 'busy'
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  fallback,
  size = 'md',
  className,
  status,
}) => {
  const sizes = {
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-9 h-9 text-xs',
    lg: 'w-12 h-12 text-sm',
    xl: 'w-16 h-16 text-base',
  }

  const getInitials = () => {
    if (fallback) return fallback.substring(0, 2).toUpperCase()
    if (alt) return alt.substring(0, 2).toUpperCase()
    return 'OM'
  }

  return (
    <div className={cn('relative inline-block shrink-0', className)}>
      <div
        className={cn(
          'relative overflow-hidden bg-[#17171b] border border-[#26262c] rounded-[2px] flex items-center justify-center font-mono font-medium text-[#8b8b94]',
          sizes[size]
        )}
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes="64px"
            className="object-cover"
            onError={(e) => {
              // Hide broken image
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <span>{getInitials()}</span>
        )}
      </div>

      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 w-2 h-2 rounded-full border border-[#0b0b0d]',
            status === 'online' && 'bg-[#3c8c5c]',
            status === 'offline' && 'bg-[#56565e]',
            status === 'busy' && 'bg-[#c43c3c]'
          )}
        />
      )}
    </div>
  )
}
