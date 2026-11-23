import React from 'react'
import { db } from '@/lib/db'
import { Inbox, CheckCircle, XCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AdminRequestsPage() {
  const requests = await db.animeRequest.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { username: true, email: true } },
    },
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="pb-4 border-b border-[#26262c]">
        <h1 className="text-xl sm:text-2xl font-bold font-heading text-[#d9d9de]">
          User Anime Requests
        </h1>
        <p className="text-xs text-[#8b8b94] mt-0.5">
          Titles requested by users that need importing.
        </p>
      </div>

      <div className="bg-[#111114] border border-[#26262c] rounded-[2px] overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#17171b] border-b border-[#26262c] text-[#8b8b94] font-mono uppercase text-[10px]">
              <th className="p-3">Title Requested</th>
              <th className="p-3">Details</th>
              <th className="p-3">User</th>
              <th className="p-3">Status</th>
              <th className="p-3">Submitted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#26262c]">
            {requests.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-[#56565e] font-mono">
                  No anime requests yet.
                </td>
              </tr>
            ) : (
              requests.map((r) => (
                <tr key={r.id} className="hover:bg-[#17171b]/50">
                  <td className="p-3 font-semibold text-[#d9d9de]">{r.title}</td>
                  <td className="p-3 text-[#8b8b94]">{r.details || '-'}</td>
                  <td className="p-3 font-mono text-[#a0a0b0]">{r.user.username}</td>
                  <td className="p-3">
                    <span className="text-[10px] font-mono uppercase bg-[#b8942c]/10 text-[#b8942c] px-1.5 py-0.5 rounded-[1px] border border-[#b8942c]/30">
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-[#56565e]">{formatDate(r.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
