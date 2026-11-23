import React from 'react'
import { Skeleton } from '@/components/ui/Skeleton'

export default function HomeLoading() {
  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Hero Skeleton */}
      <Skeleton className="w-full h-[50vh] min-h-[400px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col lg:flex-row gap-8">
        {/* Rows */}
        <div className="flex-1 min-w-0 flex flex-col gap-8">
          {[1, 2, 3].map((row) => (
            <div key={row} className="flex flex-col gap-3">
              <Skeleton width={180} height={20} />
              <div className="flex gap-4 overflow-hidden">
                {[1, 2, 3, 4, 5, 6].map((card) => (
                  <div key={card} className="w-[150px] shrink-0 flex flex-col gap-2">
                    <Skeleton variant="card" className="clip-corner-tr" />
                    <Skeleton width="80%" height={14} />
                    <Skeleton width="40%" height={10} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-4">
          <Skeleton height={400} />
        </div>
      </div>
    </div>
  )
}
