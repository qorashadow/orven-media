'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, CheckCircle2, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PasswordStrength } from '@/components/auth/PasswordStrength'
import { useToast } from '@/components/ui/Toast'
import { useI18n } from '@/context/I18nContext'

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const initialEmail = searchParams.get('email') || ''
  const token = searchParams.get('token') || ''

  const [email, setEmail] = useState(initialEmail)
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successReset, setSuccessReset] = useState(false)

  const router = useRouter()
  const { success, error } = useToast()
  const { t } = useI18n()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token || undefined,
          email: email || undefined,
          code: code || undefined,
          password,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setSuccessReset(true)
        success(t('auth.reset_password_button'))
      } else {
        setErrorMsg(data.error || 'Failed to reset password')
        error(data.error || 'Failed to reset password')
      }
    } catch {
      setErrorMsg('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (successReset) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <div className="w-12 h-12 rounded-full bg-[#3c8c5c]/10 text-[#3c8c5c] flex items-center justify-center">
          <CheckCircle2 size={24} />
        </div>
        <h2 className="text-base font-bold text-[#d9d9de] font-heading">Password Reset Complete</h2>
        <p className="text-xs text-[#8b8b94] max-w-sm">
          Your password has been securely updated. You can now log into your account with your new credentials.
        </p>
        <Link href="/auth/login" className="mt-3 w-full">
          <Button variant="primary" size="md" fullWidth clipCorner>
            Sign In Now
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold font-heading text-[#d9d9de]">{t('auth.reset_title')}</h1>
        <p className="text-xs text-[#8b8b94] mt-1">
          Enter your 6-digit verification code and new password.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-[#c43c3c]/10 border border-[#c43c3c]/30 text-xs text-[#c43c3c] rounded-[1px]">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        {!token && (
          <>
            <Input
              label={t('auth.email')}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#8b8b94] mb-1.5">
                6-Digit Reset Code
              </label>
              <input
                type="text"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="000000"
                className="w-full text-center text-xl font-mono font-bold tracking-[8px] bg-[#17171b] border border-[#26262c] focus:border-[#a0a0b0] focus:outline-none rounded-[1px] py-2 text-[#d9d9de]"
              />
            </div>
          </>
        )}

        <Input
          label={t('auth.new_password')}
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          icon={<Lock size={15} />}
        />

        {password && <PasswordStrength password={password} />}

        <Input
          label={t('auth.confirm_password')}
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          icon={<Lock size={15} />}
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={loading}
          fullWidth
          clipCorner
          className="mt-1"
        >
          {t('auth.reset_password_button')}
        </Button>
      </form>
    </div>
  )
}
