'use client'

import React, { useState, useEffect } from 'react'
import { Users, Ban, Shield, Check } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const { success, error } = useToast()

  const fetchUsers = async () => {
    try {
      const res = await fetch(`/api/admin/users?q=${encodeURIComponent(search)}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [search])

  const handleToggleBan = async (user: any) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, banned: !user.banned }),
      })
      if (res.ok) {
        success(`User ${user.username} ${user.banned ? 'unbanned' : 'banned'}`)
        fetchUsers()
      }
    } catch {
      error('Failed to update user')
    }
  }

  const handleToggleRole = async (user: any) => {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN'
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, role: newRole }),
      })
      if (res.ok) {
        success(`Role changed to ${newRole}`)
        fetchUsers()
      }
    } catch {
      error('Failed to change role')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#26262c]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-[#d9d9de]">User Management</h1>
          <p className="text-xs text-[#8b8b94] mt-0.5">Manage user accounts, roles, and ban status.</p>
        </div>

        <div className="w-full sm:w-64">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search username or email..."
          />
        </div>
      </div>

      <div className="bg-[#111114] border border-[#26262c] rounded-[2px] overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#17171b] border-b border-[#26262c] text-[#8b8b94] font-mono uppercase text-[10px]">
              <th className="p-3">User</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3">Joined</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#26262c]">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-[#17171b]/50">
                <td className="p-3 flex items-center gap-2">
                  <Avatar src={user.avatar} fallback={user.username} size="sm" />
                  <span className="font-semibold text-[#d9d9de]">{user.username}</span>
                </td>
                <td className="p-3 font-mono text-[#8b8b94]">{user.email}</td>
                <td className="p-3">
                  <span
                    className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-[1px] border ${
                      user.role === 'ADMIN'
                        ? 'bg-[#a0a0b0]/20 text-[#a0a0b0] border-[#a0a0b0]/30'
                        : 'bg-[#17171b] text-[#8b8b94] border-[#26262c]'
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="p-3">
                  {user.banned ? (
                    <span className="text-[9px] font-mono text-[#c43c3c] bg-[#c43c3c]/10 border border-[#c43c3c]/30 px-1.5 py-0.5 rounded-[1px]">
                      Banned
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono text-[#3c8c5c] bg-[#3c8c5c]/10 border border-[#3c8c5c]/30 px-1.5 py-0.5 rounded-[1px]">
                      Active
                    </span>
                  )}
                </td>
                <td className="p-3 font-mono text-[#56565e]">{formatDate(user.createdAt)}</td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleRole(user)}
                      title="Toggle Admin role"
                    >
                      <Shield size={14} className={user.role === 'ADMIN' ? 'text-[#a0a0b0]' : ''} />
                    </Button>
                    <Button
                      variant={user.banned ? 'primary' : 'danger'}
                      size="sm"
                      onClick={() => handleToggleBan(user)}
                    >
                      {user.banned ? 'Unban' : 'Ban'}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
