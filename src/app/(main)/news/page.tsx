import React from 'react'
import { db } from '@/lib/db'
import { Newspaper } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export const revalidate = 300

export default async function NewsPage() {
  const newsList = await db.news.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
      <div className="flex items-center gap-3 pb-4 border-b border-[#26262c]">
        <Newspaper size={22} className="text-[#a0a0b0]" />
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-[#d9d9de]">
            News & Announcements
          </h1>
          <p className="text-xs text-[#8b8b94] mt-0.5">
            Platform updates, community news, and seasonal schedules.
          </p>
        </div>
      </div>

      {newsList.length === 0 ? (
        <div className="py-16 text-center text-xs font-mono text-[#56565e] bg-[#111114] border border-[#26262c] rounded-[2px]">
          No news articles published yet. Check back soon!
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {newsList.map((item) => (
            <article
              key={item.id}
              className="p-5 bg-[#111114] border border-[#26262c] rounded-[2px] flex flex-col gap-2"
            >
              <span className="text-[10px] font-mono text-[#a0a0b0]">
                {formatDate(item.createdAt)}
              </span>
              <h2 className="text-base font-bold font-heading text-[#d9d9de]">{item.title}</h2>
              <p className="text-xs text-[#8b8b94] leading-relaxed whitespace-pre-line">
                {item.content}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
