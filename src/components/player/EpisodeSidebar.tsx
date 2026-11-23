'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Search, Server, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EpisodeItem, VideoServerItem } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

export interface EpisodeSidebarProps {
  animeSlug: string
  episodes: EpisodeItem[]
  currentEpisodeNumber: number
  servers?: VideoServerItem[]
  currentServer?: string
  onServerChange?: (server: string) => void
  className?: string
}

export const EpisodeSidebar: React.FC<EpisodeSidebarProps> = ({
  animeSlug,
  episodes,
  currentEpisodeNumber,
  servers = [],
  currentServer,
  onServerChange,
  className,
}) => {
  const [search, setSearch] = useState('')
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reporting, setReporting] = useState(false)
  const { success, error } = useToast()

  const filteredEpisodes = episodes.filter((ep) => {
    if (!search) return true
    const q = search.toLowerCase()
    return ep.number.toString().includes(q) || (ep.title && ep.title.toLowerCase().includes(q))
  })

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reportReason.trim()) return

    setReporting(true)
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'BROKEN_VIDEO',
          reason: reportReason,
          details: `Episode ${currentEpisodeNumber} on /watch/${animeSlug}/${currentEpisodeNumber}`,
        }),
      })

      if (res.ok) {
        success('Thank you for reporting. Our moderators will inspect this video.')
        setReportModalOpen(false)
        setReportReason('')
      } else {
        error('Failed to submit report. Please try again.')
      }
    } catch {
      error('Failed to submit report')
    } finally {
      setReporting(false)
    }
  }

  return (
    <div
      className={cn(
        'w-full lg:w-80 flex flex-col bg-[#111114] border border-[#26262c] rounded-[2px] overflow-hidden',
        className
      )}
    >
      {/* Servers section */}
      {servers.length > 0 && (
        <div className="p-3 border-b border-[#26262c] flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#8b8b94]">
            <Server size={14} className="text-[#a0a0b0]" /> Server List
          </div>
          <div className="flex flex-wrap gap-1.5">
            {servers.map((srv) => (
              <button
                key={srv.id}
                onClick={() => onServerChange?.(srv.name)}
                className={cn(
                  'px-2.5 py-1 text-xs font-mono rounded-[1px] border transition-colors',
                  currentServer === srv.name
                    ? 'bg-[#a0a0b0] text-[#0b0b0d] font-bold border-[#a0a0b0]'
                    : 'bg-[#17171b] border-[#26262c] text-[#8b8b94] hover:text-[#d9d9de]'
                )}
              >
                {srv.name} ({srv.language})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Episode Header & Search */}
      <div className="p-3 border-b border-[#26262c] flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#d9d9de] font-mono">
            Episodes ({episodes.length})
          </span>
          <button
            onClick={() => setReportModalOpen(true)}
            className="text-[10px] font-mono text-[#c43c3c] hover:underline flex items-center gap-1"
          >
            <AlertTriangle size={11} /> Report Issue
          </button>
        </div>

        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8b8b94]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ep number..."
            className="w-full h-7 pl-7 pr-2 bg-[#17171b] border border-[#26262c] text-xs font-mono text-[#d9d9de] rounded-[1px] focus:outline-none focus:border-[#a0a0b0]"
          />
        </div>
      </div>

      {/* Scrollable Episode List */}
      <div className="max-h-[500px] lg:max-h-[600px] overflow-y-auto p-2 flex flex-col gap-1">
        {filteredEpisodes.length === 0 ? (
          <div className="py-8 text-center text-xs font-mono text-[#56565e]">No episode found</div>
        ) : (
          filteredEpisodes.map((ep) => {
            const isCurrent = ep.number === currentEpisodeNumber

            return (
              <Link
                key={ep.id}
                href={`/watch/${animeSlug}/${ep.number}`}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-[1px] border transition-colors text-left',
                  isCurrent
                    ? 'bg-[#a0a0b0]/15 border-[#a0a0b0] text-[#a0a0b0] font-bold'
                    : 'bg-[#17171b]/60 border-transparent hover:border-[#26262c] text-[#8b8b94] hover:text-[#d9d9de]'
                )}
              >
                <span className="font-mono text-xs w-7 shrink-0">{ep.number}</span>
                <span className="text-xs truncate flex-1">
                  {ep.title || `Episode ${ep.number}`}
                </span>
                {ep.filler && (
                  <span className="text-[9px] font-mono text-[#c43c3c] bg-[#c43c3c]/10 px-1 rounded-[1px]">
                    Filler
                  </span>
                )}
              </Link>
            )
          })
        )}
      </div>

      {/* Report Modal */}
      <Modal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title="Report Broken Video"
        maxWidth="sm"
      >
        <form onSubmit={handleReport} className="flex flex-col gap-3">
          <p className="text-xs text-[#8b8b94]">
            Describe the problem with Episode {currentEpisodeNumber} (e.g. video not loading, audio desync, missing subtitles).
          </p>
          <textarea
            required
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="Explain what is broken..."
            className="w-full h-24 bg-[#17171b] border border-[#26262c] text-xs text-[#d9d9de] p-2.5 rounded-[1px] focus:outline-none focus:border-[#a0a0b0] resize-none"
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setReportModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="danger" size="sm" loading={reporting}>
              Submit Report
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
