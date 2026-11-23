'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bell, Tv, MessageSquare, Check, ArrowRight } from 'lucide-react'
import { Dropdown, type DropdownItem } from '@/components/ui/Dropdown'
import { formatTimeAgo } from '@/lib/utils'
import type { NotificationItem } from '@/types'

export const NotificationDropdown: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/notifications')
        if (res.ok) {
          const data = await res.json()
          setNotifications(data.notifications || [])
          setUnreadCount(data.unreadCount || 0)
        }
      } catch {}
    }
    fetchNotifications()
  }, [])

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/mark-all-read', { method: 'PUT' })
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch {}
  }

  const items: DropdownItem[] = [
    {
      label: (
        <div className="flex items-center justify-between w-full py-1">
          <span className="font-semibold text-xs text-[#d9d9de] uppercase tracking-wider font-mono">
            Notifications
          </span>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-[10px] text-[#a0a0b0] hover:underline flex items-center gap-1 font-mono"
            >
              <Check size={12} /> Mark all read
            </button>
          )}
        </div>
      ),
      disabled: true,
    },
    { divider: true, label: '' },
    ...(notifications.length === 0
      ? [
          {
            label: (
              <div className="py-4 text-center text-xs text-[#56565e] font-mono">
                No notifications yet
              </div>
            ),
            disabled: true,
          },
        ]
      : notifications.slice(0, 5).map((n) => ({
          label: (
            <Link
              href={n.link || '/notifications'}
              className="flex flex-col gap-0.5 py-1 w-full"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#d9d9de] truncate">{n.title}</span>
                {!n.read && <span className="w-1.5 h-1.5 bg-[#a0a0b0] rounded-full shrink-0" />}
              </div>
              <span className="text-[11px] text-[#8b8b94] line-clamp-1">{n.message}</span>
              <span className="text-[9px] font-mono text-[#56565e] mt-0.5">
                {formatTimeAgo(n.createdAt)}
              </span>
            </Link>
          ),
          icon: n.type === 'NEW_EPISODE' ? <Tv size={14} /> : <MessageSquare size={14} />,
        }))),
    { divider: true, label: '' },
    {
      label: (
        <Link
          href="/notifications"
          className="text-center w-full block text-xs text-[#a0a0b0] hover:underline font-mono py-0.5"
        >
          View all notifications &rarr;
        </Link>
      ),
    },
  ]

  return (
    <Dropdown
      trigger={
        <button
          className="relative h-9 w-9 flex items-center justify-center text-[#8b8b94] hover:text-[#d9d9de] hover:bg-[#17171b] rounded-[1px] transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[14px] h-[14px] px-1 bg-[#a0a0b0] text-[#0b0b0d] font-bold text-[9px] font-mono rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      }
      items={items}
      width="w-72"
      align="right"
    />
  )
}
