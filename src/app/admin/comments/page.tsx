import React from 'react'
import { db } from '@/lib/db'
import { MessageSquare, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AdminCommentsPage() {
  const comments = await db.comment.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      user: { select: { username: true, email: true } },
      anime: { select: { title: true } },
    },
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="pb-4 border-b border-[#26262c]">
        <h1 className="text-xl sm:text-2xl font-bold font-heading text-[#d9d9de]">
          Comment Moderation
        </h1>
        <p className="text-xs text-[#8b8b94] mt-0.5">
          Review community discussions, remove toxic content or spoilers.
        </p>
      </div>

      <div className="bg-[#111114] border border-[#26262c] rounded-[2px] overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#17171b] border-b border-[#26262c] text-[#8b8b94] font-mono uppercase text-[10px]">
              <th className="p-3">User</th>
              <th className="p-3">Anime</th>
              <th className="p-3">Comment Content</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#26262c]">
            {comments.map((c) => (
              <tr key={c.id} className="hover:bg-[#17171b]/50">
                <td className="p-3 font-semibold text-[#a0a0b0]">{c.user.username}</td>
                <td className="p-3 font-mono text-[#8b8b94]">{c.anime?.title || 'Global'}</td>
                <td className="p-3 text-[#d9d9de] max-w-md truncate">{c.content}</td>
                <td className="p-3 font-mono text-[#56565e]">{formatDate(c.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
