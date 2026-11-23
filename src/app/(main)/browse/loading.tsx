import React from 'react'
import { Skeleton } from '@/components/ui/Skeleton'

export default function BrowseLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
      <div className="flex justify-between items-center pb-4 border-b border-[#26262c]">
        <Skeleton width={200} height={28} />
        <Skeleton width={100} height={20} />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-64 shrink-0">
          <Skeleton height={500} />
        </div>
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton variant="card" className="clip-corner-tr" />
              <Skeleton width="80%" height={14} />
              <Skeleton width="50%" height={10} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
