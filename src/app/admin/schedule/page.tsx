import React from 'react'
import { db } from '@/lib/db'
import { Calendar, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AdminSchedulePage() {
  const schedules = await db.schedule.findMany({
    orderBy: { airingAt: 'asc' },
    include: {
      anime: { select: { title: true, type: true } },
    },
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#26262c]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-[#d9d9de]">
            Schedule Management
          </h1>
          <p className="text-xs text-[#8b8b94] mt-0.5">
            Manage upcoming release dates and countdowns for active airing series.
          </p>
        </div>
      </div>

      <div className="bg-[#111114] border border-[#26262c] rounded-[2px] overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#17171b] border-b border-[#26262c] text-[#8b8b94] font-mono uppercase text-[10px]">
              <th className="p-3">Anime</th>
              <th className="p-3">Episode</th>
              <th className="p-3">Airing At</th>
              <th className="p-3">Format</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#26262c]">
            {schedules.map((s) => (
              <tr key={s.id} className="hover:bg-[#17171b]/50">
                <td className="p-3 font-semibold text-[#d9d9de]">{s.anime.title}</td>
                <td className="p-3 font-mono text-[#a0a0b0]">Episode {s.episodeNumber}</td>
                <td className="p-3 font-mono text-[#8b8b94]">
                  {new Date(s.airingAt).toLocaleString()}
                </td>
                <td className="p-3 font-mono text-[#56565e]">{s.anime.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
