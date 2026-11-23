'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ScheduleItem } from '@/types'

export interface ScheduleCardProps {
  item: ScheduleItem
  className?: string
}

export const ScheduleCard: React.FC<ScheduleCardProps> = ({ item, className }) => {
  const [timeLeft, setTimeLeft] = useState('')
  const [imgError, setImgError] = useState(false)
  const [airTime, setAirTime] = useState('')

  useEffect(() => {
    try {
      const d = new Date(item.airingAt)
      setAirTime(
        d.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      )
    } catch {}

    const updateCountdown = () => {
      const now = new Date().getTime()
      const target = new Date(item.airingAt).getTime()
      const diff = target - now

      if (diff <= 0) {
        setTimeLeft('Aired')
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`)
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`)
      } else {
        setTimeLeft(`${minutes}m`)
      }
    }

    updateCountdown()
    const timer = setInterval(updateCountdown, 60000)
    return () => clearInterval(timer)
  }, [item.airingAt])

  return (
    <Link
      href={`/anime/${item.anime.slug}`}
      className={cn(
        'group flex items-center justify-between p-2.5 bg-[#111114] border border-[#26262c] hover:border-[#3a3a44] rounded-[2px] transition-colors',
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative w-10 h-14 bg-[#17171b] rounded-[1px] overflow-hidden shrink-0 border border-[#26262c]">
          {item.anime.poster && !imgError ? (
            <Image
              src={item.anime.poster}
              alt=""
              fill
              sizes="40px"
              className="object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#17171b] text-[9px] font-mono text-[#a0a0b0] font-bold">
              OM
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h4 className="text-xs font-semibold text-[#d9d9de] group-hover:text-[#a0a0b0] truncate transition-colors">
            {item.anime.title}
          </h4>
          <span className="text-[10px] font-mono text-[#8b8b94] mt-0.5 block">
            Episode {item.episodeNumber}
          </span>
          <span suppressHydrationWarning className="text-[10px] font-mono text-[#56565e]">{airTime}</span>
        </div>
      </div>

      <div className="flex flex-col items-end shrink-0 pl-2">
        <span
          suppressHydrationWarning
          className={cn(
            'text-[10px] font-mono font-medium px-2 py-0.5 rounded-[1px] border flex items-center gap-1',
            timeLeft === 'Aired'
              ? 'bg-[#3c8c5c]/15 text-[#3c8c5c] border-[#3c8c5c]/30'
              : 'bg-[#17171b] text-[#a0a0b0] border-[#26262c]'
          )}
        >
          <Clock size={10} />
          {timeLeft}
        </span>
      </div>
    </Link>
  )
}
