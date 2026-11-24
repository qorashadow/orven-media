'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Mail, Lock, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { OAuthButtons } from '@/components/auth/OAuthButtons'
import { useI18n } from '@/context/I18nContext'

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const { success, error } = useToast()
  const { t } = useI18n()

  React.useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      success(t('auth.account_verified') || 'Account verified! Please sign in.')
    }
  }, [searchParams, success, t])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: identifier,
        password,
        remember: rememberMe ? 'true' : 'false',
      })

      if (res?.error) {
        let msg = 'Invalid email/username or password'
        if (res.error === 'Your account has been banned.') {
          msg = res.error
        } else if (
          res.error === 'Please verify your email address before logging in.' ||
          res.error.includes('Please verify your email address')
        ) {
          msg = t('auth.email_not_verified') || 'Please verify your email address before logging in.'
        } else if (res.error === 'CredentialsSignin') {
          msg = 'Invalid email/username or password'
        } else if (res.error === 'Configuration') {
          msg = 'Server authentication error. Please contact administrator.'
        }
        setErrorMsg(msg)
        error(msg)
      } else {
        success('Welcome back to Orven Media!')
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (err: any) {
      const msg = err?.message || 'An unexpected error occurred. Please try again.'
      setErrorMsg(msg)
      error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold font-heading text-[#d9d9de]">{t('auth.login_title')}</h1>
        <p className="text-xs text-[#8b8b94] mt-1">
          {t('auth.login_subtitle')}
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-[#c43c3c]/10 border border-[#c43c3c]/30 text-xs text-[#c43c3c] rounded-[1px]">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <Input
          label={`${t('auth.email')} / ${t('auth.username')}`}
          type="text"
          required
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="email or username"
          icon={<Mail size={15} />}
        />

        <div className="flex flex-col gap-1">
          <Input
            label={t('auth.password')}
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            icon={<Lock size={15} />}
          />
          <div className="flex items-center justify-between mt-1">
            <label className="flex items-center gap-1.5 text-[11px] font-mono text-[#8b8b94] cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded-[1px] border-[#26262c] bg-[#17171b] text-[#a0a0b0]"
              />
              {t('auth.remember_me')}
            </label>

            <Link
              href="/auth/forgot-password"
              className="text-[11px] font-mono text-[#8b8b94] hover:text-[#a0a0b0] transition-colors"
            >
              {t('auth.forgot_password')}
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={loading}
          fullWidth
          clipCorner
          icon={<LogIn size={15} />}
          className="mt-1"
        >
          {t('auth.sign_in_button')}
        </Button>
      </form>

      {/* OAuth Buttons */}
      <OAuthButtons callbackUrl={callbackUrl} />

      {/* Register link */}
      <div className="text-center text-xs text-[#8b8b94] pt-2 border-t border-[#26262c]">
        {t('auth.no_account')}{' '}
        <Link href="/auth/register" className="text-[#a0a0b0] font-semibold hover:underline">
          {t('auth.register_button')}
        </Link>
      </div>
    </div>
  )
}
