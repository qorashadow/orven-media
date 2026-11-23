import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { ADMIN_NAV_ITEMS } from '@/lib/constants'
import {
  LayoutDashboard,
  Tv,
  Users,
  MessageSquare,
  Flag,
  Inbox,
  Star,
  Calendar,
  Megaphone,
  Newspaper,
  Settings,
  ScrollText,
  ArrowLeft,
  Shield,
} from 'lucide-react'

const iconMap: Record<string, React.ReactNode> = {
  'layout-dashboard': <LayoutDashboard size={16} />,
  tv: <Tv size={16} />,
  users: <Users size={16} />,
  'message-square': <MessageSquare size={16} />,
  flag: <Flag size={16} />,
  inbox: <Inbox size={16} />,
  star: <Star size={16} />,
  calendar: <Calendar size={16} />,
  megaphone: <Megaphone size={16} />,
  newspaper: <Newspaper size={16} />,
  settings: <Settings size={16} />,
  'scroll-text': <ScrollText size={16} />,
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-[#d9d9de] flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#111114] border-r border-[#26262c] flex flex-col shrink-0">
        {/* Brand bar */}
        <div className="h-16 px-6 border-b border-[#26262c] flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#a0a0b0] text-[#0b0b0d] font-bold text-xs flex items-center justify-center font-heading clip-corner-tr">
              OM
            </div>
            <span className="font-heading font-bold text-sm tracking-wide text-[#d9d9de] flex items-center gap-1.5">
              ORVEN <span className="text-[#a0a0b0] text-xs font-mono font-normal">ADMIN</span>
            </span>
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 p-3 flex flex-col gap-0.5 overflow-y-auto">
          {ADMIN_NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-mono rounded-[1px] text-[#8b8b94] hover:text-[#d9d9de] hover:bg-[#17171b] transition-colors"
            >
              <span className="text-[#a0a0b0]">{iconMap[item.icon] || <Shield size={16} />}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Back to site */}
        <div className="p-3 border-t border-[#26262c]">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-xs font-mono text-[#8b8b94] hover:text-[#d9d9de] bg-[#17171b] rounded-[1px] transition-colors"
          >
            <ArrowLeft size={14} /> Back to Website
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-[#111114] border-b border-[#26262c] px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#8b8b94]">Logged in as:</span>
            <span className="text-xs font-mono font-bold text-[#a0a0b0]">
              {session.user.name || session.user.username}
            </span>
          </div>

          <div className="text-[11px] font-mono text-[#56565e]">Orven Admin Console v1.0</div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
