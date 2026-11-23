import React from 'react'
import { db } from '@/lib/db'
import { ScheduleCard } from '@/components/anime/ScheduleCard'
import { Calendar } from 'lucide-react'

export const revalidate = 60

export default async function SchedulePage() {
  const schedules = await db.schedule.findMany({
    orderBy: { airingAt: 'asc' },
    include: {
      anime: {
        select: {
          id: true,
          title: true,
          slug: true,
          poster: true,
          type: true,
        },
      },
    },
  })

  // Group by day of week
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const todayIndex = new Date().getDay()

  const grouped: Record<string, typeof schedules> = {}
  daysOfWeek.forEach((day) => (grouped[day] = []))

  schedules.forEach((item) => {
    const day = daysOfWeek[new Date(item.airingAt).getDay()]
    grouped[day].push(item)
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
      <div className="flex items-center gap-3 pb-4 border-b border-[#26262c]">
        <Calendar size={22} className="text-[#a0a0b0]" />
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-[#d9d9de]">
            Weekly Release Schedule
          </h1>
          <p className="text-xs text-[#8b8b94] mt-0.5">
            Real-time airing times and countdowns for new episodes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {daysOfWeek.map((day, idx) => {
          const isToday = idx === todayIndex
          const items = grouped[day]

          return (
            <div
              key={day}
              className={`flex flex-col gap-3 p-4 bg-[#111114] border rounded-[2px] ${
                isToday ? 'border-[#a0a0b0]/50 ring-1 ring-[#a0a0b0]/30' : 'border-[#26262c]'
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#26262c]">
                <span className="text-xs font-bold uppercase tracking-wider font-mono text-[#d9d9de] flex items-center gap-1.5">
                  {day} {isToday && <span className="text-[10px] text-[#a0a0b0]">• Today</span>}
                </span>
                <span className="text-[10px] font-mono text-[#56565e]">{items.length} titles</span>
              </div>

              {items.length === 0 ? (
                <div className="py-6 text-center text-xs font-mono text-[#56565e]">
                  No releases scheduled
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {items.map((item) => (
                    <ScheduleCard key={item.id} item={item as any} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
