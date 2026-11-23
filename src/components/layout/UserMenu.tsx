'use client'

import React from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import {
  User as UserIcon,
  Bookmark,
  Heart,
  History,
  Settings,
  Shield,
  LogOut,
} from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Dropdown, type DropdownItem } from '@/components/ui/Dropdown'
import { useI18n } from '@/context/I18nContext'

export interface UserMenuProps {
  user: {
    id?: string
    name?: string | null
    username?: string | null
    email?: string | null
    image?: string | null
    role?: string
  }
}

export const UserMenu: React.FC<UserMenuProps> = ({ user }) => {
  const { t } = useI18n()
  const username = user.username || user.name || 'User'
  const isAdmin = user.role === 'ADMIN'

  const items: DropdownItem[] = [
    {
      label: (
        <div className="flex flex-col">
          <span className="font-semibold text-[#d9d9de]">{username}</span>
          <span className="text-[10px] text-[#56565e] truncate font-mono">{user.email}</span>
        </div>
      ),
      disabled: true,
    },
    { divider: true, label: '' },
    {
      label: <Link href={`/profile/${username}`}>{t('header.profile')}</Link>,
      icon: <UserIcon size={14} />,
    },
    {
      label: <Link href={`/profile/${username}?tab=watchlist`}>Watchlist</Link>,
      icon: <Bookmark size={14} />,
    },
    {
      label: <Link href={`/profile/${username}?tab=favorites`}>Favorites</Link>,
      icon: <Heart size={14} />,
    },
    {
      label: <Link href={`/profile/${username}?tab=history`}>Watch History</Link>,
      icon: <History size={14} />,
    },
    {
      label: <Link href="/settings">{t('header.settings')}</Link>,
      icon: <Settings size={14} />,
    },
    ...(isAdmin
      ? [
          { divider: true, label: '' },
          {
            label: (
              <Link href="/admin" className="text-[#a0a0b0] font-medium flex items-center gap-1.5">
                {t('header.admin')}
              </Link>
            ),
            icon: <Shield size={14} className="text-[#a0a0b0]" />,
          },
        ]
      : []),
    { divider: true, label: '' },
    {
      label: t('header.logout'),
      icon: <LogOut size={14} />,
      danger: true,
      onClick: () => signOut({ callbackUrl: '/' }),
    },
  ]

  return (
    <Dropdown
      trigger={
        <button className="flex items-center gap-2 p-0.5 rounded-[2px] hover:ring-1 hover:ring-[#26262c] transition-all">
          <Avatar
            src={user.image}
            alt={username}
            fallback={username}
            size="sm"
          />
        </button>
      }
      items={items}
      width="w-52"
      align="right"
    />
  )
}
