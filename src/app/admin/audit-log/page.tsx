import React from 'react'
import { db } from '@/lib/db'
import { ScrollText } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AdminAuditLogPage() {
  const logs = await db.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="pb-4 border-b border-[#26262c]">
        <h1 className="text-xl sm:text-2xl font-bold font-heading text-[#d9d9de]">System Audit Log</h1>
        <p className="text-xs text-[#8b8b94] mt-0.5">
          Immutable log of administrative actions, user role modifications, and system events.
        </p>
      </div>

      <div className="bg-[#111114] border border-[#26262c] rounded-[2px] overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#17171b] border-b border-[#26262c] text-[#8b8b94] font-mono uppercase text-[10px]">
              <th className="p-3">Timestamp</th>
              <th className="p-3">Action</th>
              <th className="p-3">Target</th>
              <th className="p-3">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#26262c]">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-[#56565e] font-mono">
                  No audit logs recorded yet.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-[#17171b]/50">
                  <td className="p-3 font-mono text-[#56565e]">{formatDate(log.createdAt)}</td>
                  <td className="p-3 font-semibold text-[#a0a0b0] font-mono">{log.action}</td>
                  <td className="p-3 font-mono text-[#d9d9de]">{log.target}</td>
                  <td className="p-3 text-[#8b8b94]">{log.details || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
