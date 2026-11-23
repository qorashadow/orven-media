'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Settings as SettingsIcon, Shield, EyeOff } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'

export interface ProfileHeaderProps {
  user: {
    id: string
    username: string
    name?: string | null
    bio?: string | null
    avatar?: string | null
    banner?: string | null
    role: string
    createdAt: Date | string
    isPublic: boolean
  }
  isOwnProfile?: boolean
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, isOwnProfile = false }) => {
  return (
    <div className="relative w-full bg-[#111114] border border-[#26262c] rounded-[2px] overflow-hidden">
      {/* Banner */}
      <div className="relative h-44 sm:h-56 w-full bg-[#17171b]">
        {user.banner ? (
          <Image
            src={user.banner}
            alt={user.username}
            fill
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-[#17171b] via-[#202026] to-[#17171b]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111114] via-transparent to-transparent" />
      </div>

      {/* Profile info row */}
      <div className="px-4 sm:px-8 pb-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-16 sm:-mt-12 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
          {/* Avatar */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[2px] bg-[#111114] p-1 border border-[#26262c] overflow-hidden shrink-0 shadow-2xl">
            <Avatar
              src={user.avatar}
              alt={user.username}
              fallback={user.username}
              size="xl"
              className="w-full h-full"
            />
          </div>

          {/* Names and Bio */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[#d9d9de] font-heading">
                {user.name || user.username}
              </h1>
              {user.role === 'ADMIN' && (
                <span className="bg-[#a0a0b0]/20 text-[#a0a0b0] border border-[#a0a0b0]/40 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-[1px] flex items-center gap-1">
                  <Shield size={10} /> Admin
                </span>
              )}
              {!user.isPublic && (
                <span className="text-[10px] font-mono text-[#8b8b94] flex items-center gap-1">
                  <EyeOff size={10} /> Private
                </span>
              )}
            </div>

            <span className="text-xs font-mono text-[#8b8b94]">@{user.username}</span>

            {user.bio && (
              <p className="text-xs text-[#8b8b94] max-w-lg mt-1 line-clamp-2">{user.bio}</p>
            )}

            <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#56565e] mt-1">
              <Calendar size={12} /> Joined {formatDate(user.createdAt)}
            </div>
          </div>
        </div>

        {/* Edit / Settings Button */}
        {isOwnProfile && (
          <Link href="/settings">
            <Button size="sm" variant="secondary" icon={<SettingsIcon size={14} />}>
              Edit Profile
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
