import React from 'react'
import { Skeleton } from '@/components/ui/Skeleton'

export default function AnimeDetailLoading() {
  return (
    <div className="flex flex-col gap-8 pb-16">
      <Skeleton className="w-full h-[40vh] min-h-[300px]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-32 relative z-10 flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 lg:w-72 shrink-0 flex flex-col gap-4">
          <Skeleton variant="card" className="clip-corner-tr" />
          <Skeleton height={44} />
          <Skeleton height={150} />
        </div>
        <div className="flex-1 flex flex-col gap-6">
          <Skeleton width="60%" height={36} />
          <Skeleton width="40%" height={16} />
          <Skeleton height={120} />
          <Skeleton height={300} />
        </div>
      </div>
    </div>
  )
}
