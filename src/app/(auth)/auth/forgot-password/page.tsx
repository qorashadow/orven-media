'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useI18n } from '@/context/I18nContext'
import { useToast } from '@/components/ui/Toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const router = useRouter()
  const { t, locale } = useI18n()
  const { success } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, locale }),
      })
      setSubmitted(true)
      success(t('auth.code_resent'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold font-heading text-[#d9d9de]">{t('auth.reset_title')}</h1>
        <p className="text-xs text-[#8b8b94] mt-1">
          {t('auth.reset_subtitle')}
        </p>
      </div>

      {submitted ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <div className="w-12 h-12 rounded-full bg-[#3c8c5c]/10 text-[#3c8c5c] flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
          <p className="text-xs text-[#d9d9de]">
            If an account exists for <span className="font-mono text-[#a0a0b0]">{email}</span>, a 6-digit reset code has been dispatched.
          </p>
          <div className="flex flex-col gap-2 w-full mt-2">
            <Link href={`/auth/reset-password?email=${encodeURIComponent(email)}`} className="w-full">
              <Button variant="primary" size="md" fullWidth clipCorner>
                Enter 6-Digit Reset Code
              </Button>
            </Link>
            <Link href="/auth/login" className="w-full">
              <Button variant="secondary" size="sm" fullWidth>
                Back to Sign in
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label={t('auth.email')}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            icon={<Mail size={15} />}
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
            fullWidth
            clipCorner
          >
            {t('auth.send_reset_code')}
          </Button>

          <div className="text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1.5 text-xs text-[#8b8b94] hover:text-[#d9d9de] transition-colors"
            >
              <ArrowLeft size={13} />
              <span>Back to Sign in</span>
            </Link>
          </div>
        </form>
      )}
    </div>
  )
}
