'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Compass, Search, Calendar, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSession } from 'next-auth/react'

export const MobileNav: React.FC = () => {
  const pathname = usePathname()
  const { data: session } = useSession()

  const navItems = [
    { href: '/', label: 'Home', icon: <Home size={18} /> },
    { href: '/browse', label: 'Browse', icon: <Compass size={18} /> },
    { href: '/search', label: 'Search', icon: <Search size={18} /> },
    { href: '/schedule', label: 'Schedule', icon: <Calendar size={18} /> },
    {
      href: session?.user ? `/profile/${session.user.username}` : '/auth/login',
      label: session?.user ? 'Profile' : 'Sign in',
      icon: <User size={18} />,
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0b0b0d]/95 backdrop-blur-lg border-t border-[#26262c] h-14 md:hidden">
      <div className="grid grid-cols-5 h-full">
        {navItems.map((item) => {
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 select-none transition-colors',
                isActive ? 'text-[#d9d9de] font-semibold' : 'text-[#8b8b94] hover:text-[#d9d9de]'
              )}
            >
              <span className={cn(isActive && 'text-[#a0a0b0]')}>{item.icon}</span>
              <span className="text-[10px] font-mono tracking-tight">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
