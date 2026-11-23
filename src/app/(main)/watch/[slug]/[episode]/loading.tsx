import React from 'react'
import { Skeleton } from '@/components/ui/Skeleton'

export default function WatchLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
      <Skeleton width={300} height={16} />
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 flex flex-col gap-4">
          <Skeleton className="w-full aspect-video rounded-[2px]" />
          <Skeleton height={60} />
          <Skeleton height={200} />
        </div>
        <div className="w-full lg:w-80 shrink-0">
          <Skeleton height={600} />
        </div>
      </div>
    </div>
  )
}
