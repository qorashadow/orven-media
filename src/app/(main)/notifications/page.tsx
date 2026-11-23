'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bell, Check, Tv, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatTimeAgo } from '@/lib/utils'
import type { NotificationItem } from '@/types'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications/mark-all-read', { method: 'PUT' })
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch {}
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#26262c]">
        <div className="flex items-center gap-2.5">
          <Bell size={20} className="text-[#a0a0b0]" />
          <h1 className="text-xl font-bold font-heading text-[#d9d9de]">Notifications</h1>
        </div>

        {notifications.some((n) => !n.read) && (
          <Button variant="secondary" size="sm" onClick={handleMarkAllRead} icon={<Check size={14} />}>
            Mark all as read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs font-mono text-[#56565e]">
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div className="py-16 text-center text-xs font-mono text-[#56565e] bg-[#111114] border border-[#26262c] rounded-[2px]">
          No notifications yet.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => (
            <Link
              key={n.id}
              href={n.link || '#'}
              className={`flex items-start gap-3 p-3.5 bg-[#111114] border rounded-[2px] transition-colors ${
                !n.read ? 'border-[#a0a0b0]/40 bg-[#17171b]/60' : 'border-[#26262c]'
              }`}
            >
              <div className="w-8 h-8 rounded-[1px] bg-[#17171b] border border-[#26262c] flex items-center justify-center text-[#a0a0b0] shrink-0">
                {n.type === 'NEW_EPISODE' ? <Tv size={15} /> : <MessageSquare size={15} />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#d9d9de]">{n.title}</span>
                  <span className="text-[10px] font-mono text-[#56565e]">
                    {formatTimeAgo(n.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-[#8b8b94] mt-0.5">{n.message}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
