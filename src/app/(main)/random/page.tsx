'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dices } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'

export default function RandomPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const getRandomAnime = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/anime/random')
      const data = await res.json()
      if (data?.slug) {
        router.push(`/anime/${data.slug}`)
      } else {
        router.push('/browse')
      }
    } catch {
      router.push('/browse')
    }
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-[2px] bg-[#111114] border border-[#26262c] flex items-center justify-center text-[#a0a0b0] mb-4 shadow-xl">
        <Dices size={32} />
      </div>

      <h1 className="text-2xl font-bold font-heading text-[#d9d9de]">Random Anime Selector</h1>
      <p className="text-xs text-[#8b8b94] max-w-sm mt-1 mb-6">
        Can&apos;t decide what to watch next? Let fate choose for you.
      </p>

      <Button
        variant="primary"
        size="lg"
        clipCorner
        loading={loading}
        onClick={getRandomAnime}
        icon={<Dices size={18} />}
      >
        Roll the Dice
      </Button>
    </div>
  )
}
