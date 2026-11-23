'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Runtime error:', error)
  }, [error])

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
      <div className="w-14 h-14 rounded-[2px] bg-[#c43c3c]/10 border border-[#c43c3c]/30 flex items-center justify-center text-[#c43c3c] mb-4">
        <AlertTriangle size={28} />
      </div>

      <h1 className="text-xl sm:text-2xl font-bold font-heading text-[#d9d9de]">
        An Unexpected Error Occurred
      </h1>
      <p className="text-xs text-[#8b8b94] max-w-md mt-1 mb-6">
        Our engineers have been notified. Please try reloading the page or return to safety.
      </p>

      <div className="flex items-center gap-3">
        <Button variant="primary" size="md" clipCorner onClick={() => reset()} icon={<RotateCcw size={15} />}>
          Try Again
        </Button>
        <Link href="/">
          <Button variant="secondary" size="md" icon={<Home size={15} />}>
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  )
}
