import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Compass, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
      <div className="relative font-heading font-black text-8xl sm:text-9xl text-[#17171b] select-none tracking-tighter">
        404
        <div className="absolute inset-0 flex items-center justify-center text-xl sm:text-2xl font-mono text-[#a0a0b0] tracking-widest">
          VOID DETECTED
        </div>
      </div>

      <h1 className="text-xl sm:text-2xl font-bold font-heading text-[#d9d9de] mt-4">
        Lost in the Animation Void
      </h1>
      <p className="text-xs text-[#8b8b94] max-w-sm mt-1 mb-6">
        The title or page you are looking for has been moved, deleted, or never existed in this dimension.
      </p>

      <div className="flex items-center gap-3">
        <Link href="/">
          <Button variant="primary" size="md" clipCorner icon={<Home size={15} />}>
            Back to Home
          </Button>
        </Link>
        <Link href="/browse">
          <Button variant="secondary" size="md" icon={<Compass size={15} />}>
            Explore Catalog
          </Button>
        </Link>
      </div>
    </div>
  )
}
