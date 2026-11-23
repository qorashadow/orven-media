'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Spinner } from '@/components/ui/Spinner'

export interface AuthGuardProps {
  children: React.ReactNode
  adminOnly?: boolean
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, adminOnly = false }) => {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated' && adminOnly && session?.user?.role !== 'ADMIN') {
      router.push('/')
    }
  }, [status, session, adminOnly, router])

  if (status === 'loading') {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (status === 'unauthenticated') return null
  if (adminOnly && session?.user?.role !== 'ADMIN') return null

  return <>{children}</>
}
