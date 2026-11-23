'use client'

import React, { useState, useEffect } from 'react'
import { Flag, CheckCircle, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { success, error } = useToast()

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/reports')
      if (res.ok) {
        const data = await res.json()
        setReports(data.reports || [])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div className="pb-4 border-b border-[#26262c]">
        <h1 className="text-xl sm:text-2xl font-bold font-heading text-[#d9d9de]">
          Reports & Video Issues
        </h1>
        <p className="text-xs text-[#8b8b94] mt-0.5">
          User-submitted reports for broken videos, faulty subtitles, or inappropriate comments.
        </p>
      </div>

      <div className="bg-[#111114] border border-[#26262c] rounded-[2px] overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#17171b] border-b border-[#26262c] text-[#8b8b94] font-mono uppercase text-[10px]">
              <th className="p-3">Type</th>
              <th className="p-3">Reason</th>
              <th className="p-3">Details / Location</th>
              <th className="p-3">Reported By</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#26262c]">
            {reports.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-[#56565e] font-mono">
                  No pending reports. All systems operational!
                </td>
              </tr>
            ) : (
              reports.map((r) => (
                <tr key={r.id} className="hover:bg-[#17171b]/50">
                  <td className="p-3">
                    <span className="text-[10px] font-mono uppercase bg-[#c43c3c]/15 text-[#c43c3c] border border-[#c43c3c]/30 px-1.5 py-0.5 rounded-[1px]">
                      {r.type}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-[#d9d9de]">{r.reason}</td>
                  <td className="p-3 font-mono text-[11px] text-[#8b8b94]">{r.details || '-'}</td>
                  <td className="p-3 font-mono text-xs text-[#a0a0b0]">
                    {r.user?.username || 'Guest'}
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
