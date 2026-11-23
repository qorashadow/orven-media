'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Mail, Lock, User as UserIcon, UserPlus, ShieldCheck, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PasswordStrength } from '@/components/auth/PasswordStrength'
import { useToast } from '@/components/ui/Toast'
import { OAuthButtons } from '@/components/auth/OAuthButtons'
import { useI18n } from '@/context/I18nContext'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Verification step state
  const [step, setStep] = useState<'form' | 'verify'>('form')
  const [verifyCode, setVerifyCode] = useState('')
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(60)
  const [canResend, setCanResend] = useState(false)

  const router = useRouter()
  const { success, error } = useToast()
  const { t, locale } = useI18n()

  // Cooldown countdown
  useEffect(() => {
    let timer: any
    if (step === 'verify' && resendCooldown > 0) {
      setCanResend(false)
      timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            setCanResend(true)
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [step, resendCooldown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match')
      return
    }

    if (!acceptTerms) {
      setErrorMsg('You must agree to the Terms of Service')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          password,
          confirmPassword,
          acceptTerms,
          locale,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to create account')
        error(data.error || 'Failed to create account')
      } else {
        success('Verification code dispatched to your email!')
        setStep('verify')
        setResendCooldown(60)
      }
    } catch {
      setErrorMsg('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setVerifyLoading(true)

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code: verifyCode,
          locale,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error || 'Verification failed')
        error(data.error || 'Verification failed')
      } else {
        success(t('auth.account_verified'))
        // Auto-login after successful verification
        const loginRes = await signIn('credentials', {
          redirect: false,
          email,
          password,
        })

        if (loginRes?.ok) {
          router.push('/')
          router.refresh()
        } else {
          router.push('/auth/login')
        }
      }
    } catch {
      setErrorMsg('Failed to verify code')
    } finally {
      setVerifyLoading(false)
    }
  }

  const handleResend = async () => {
    if (!canResend) return
    setErrorMsg('')

    try {
      const res = await fetch('/api/auth/verify/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, locale }),
      })

      const data = await res.json()
      if (res.ok) {
        success(t('auth.code_resent'))
        setResendCooldown(60)
        setCanResend(false)
      } else {
        setErrorMsg(data.error || 'Failed to resend code')
      }
    } catch {
      setErrorMsg('Error resending verification code')
    }
  }

  const handleBack = async () => {
    setErrorMsg('')
    setStep('form')
    setVerifyCode('')
    // Cancel the pending unverified registration in background so username and email are immediately free
    if (email) {
      try {
        await fetch('/api/auth/register/cancel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })
      } catch (err) {
        console.error('Cancel dispatch failed:', err)
      }
    }
  }

  // Step 2: Verification Screen
  if (step === 'verify') {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#a0a0b0]/15 text-[#a0a0b0] flex items-center justify-center rounded-[1px] border border-[#a0a0b0]/30 shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold font-heading text-[#d9d9de]">{t('auth.verification_title')}</h1>
            <p className="text-xs text-[#8b8b94] mt-0.5">
              {t('auth.verification_subtitle', { email })}
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-[#c43c3c]/10 border border-[#c43c3c]/30 text-xs text-[#c43c3c] rounded-[1px]">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleVerify} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#8b8b94] mb-1.5">
              {t('auth.enter_code')}
            </label>
            <input
              type="text"
              maxLength={6}
              autoFocus
              required
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="000000"
              className="w-full text-center text-2xl font-mono font-bold tracking-[12px] bg-[#17171b] border border-[#26262c] focus:border-[#a0a0b0] focus:outline-none rounded-[1px] py-3 text-[#d9d9de]"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={verifyLoading}
            fullWidth
            clipCorner
          >
            {t('auth.verify_button')}
          </Button>
        </form>

        <div className="flex items-center justify-between pt-2 border-t border-[#26262c] text-xs font-mono">
          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend}
            className={`flex items-center gap-1.5 ${
              canResend
                ? 'text-[#a0a0b0] hover:text-[#d9d9de] cursor-pointer'
                : 'text-[#56565e] cursor-not-allowed'
            }`}
          >
            <RefreshCw size={13} className={!canResend ? 'animate-spin' : ''} />
            {canResend ? t('auth.resend_code') : t('auth.resend_in', { seconds: resendCooldown })}
          </button>

          <button
            type="button"
            onClick={handleBack}
            className="text-[#8b8b94] hover:text-[#d9d9de] underline"
          >
            {t('common.back')}
          </button>
        </div>
      </div>
    )
  }

  // Step 1: Registration Form
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold font-heading text-[#d9d9de]">{t('auth.register_title')}</h1>
        <p className="text-xs text-[#8b8b94] mt-1">
          {t('auth.register_subtitle')}
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-[#c43c3c]/10 border border-[#c43c3c]/30 text-xs text-[#c43c3c] rounded-[1px]">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <Input
          label={t('auth.username')}
          type="text"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g. shadow_hunter"
          icon={<UserIcon size={15} />}
        />

        <Input
          label={t('auth.email')}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          icon={<Mail size={15} />}
        />

        <Input
          label={t('auth.password')}
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

        <label className="flex items-start gap-2 text-[11px] text-[#8b8b94] cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-0.5 rounded-[1px] border-[#26262c] bg-[#17171b] text-[#a0a0b0]"
          />
          <span>
            I agree to the{' '}
            <Link href="/terms" className="text-[#a0a0b0] underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-[#a0a0b0] underline">
              Privacy Policy
            </Link>
          </span>
        </label>

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={loading}
          fullWidth
          clipCorner
          icon={<UserPlus size={15} />}
          className="mt-1"
        >
          {t('auth.register_button')}
        </Button>
      </form>

      {/* OAuth Buttons */}
      <OAuthButtons callbackUrl="/" />

      {/* Login link */}
      <div className="text-center text-xs text-[#8b8b94] pt-2 border-t border-[#26262c]">
        {t('auth.have_account')}{' '}
        <Link href="/auth/login" className="text-[#a0a0b0] font-semibold hover:underline">
          {t('auth.sign_in_button')}
        </Link>
      </div>
    </div>
  )
}
