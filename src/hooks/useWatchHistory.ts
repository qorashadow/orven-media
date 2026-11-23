'use client'

import { useRef, useCallback } from 'react'
import { throttle } from '@/lib/utils'

export function useWatchHistory(animeId?: string, episodeId?: string) {
  const lastSavedRef = useRef<number>(0)

  const saveProgress = useCallback(
    throttle(async (currentTime: number, duration: number) => {
      if (!animeId || !episodeId || duration === 0) return

      // Don't save if progress changed less than 5 seconds
      if (Math.abs(currentTime - lastSavedRef.current) < 5) return
      lastSavedRef.current = currentTime

      try {
        await fetch('/api/watch-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            animeId,
            episodeId,
            progress: Math.floor(currentTime),
            duration: Math.floor(duration),
            completed: currentTime / duration >= 0.9,
          }),
        })
      } catch {}
    }, 10000), // 10 seconds throttle
    [animeId, episodeId]
  )

  return { saveProgress }
}
