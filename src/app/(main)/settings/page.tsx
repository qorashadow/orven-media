'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  User,
  Shield,
  Sliders,
  Tv,
  Mail,
  KeyRound,
  Laptop,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Globe,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Toggle } from '@/components/ui/Toggle'
import { Select } from '@/components/ui/Select'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { PasswordStrength } from '@/components/auth/PasswordStrength'
import { useToast } from '@/components/ui/Toast'
import { SUBTITLE_LANGUAGES, QUALITY_OPTIONS } from '@/lib/constants'
import { useI18n, type Locale } from '@/context/I18nContext'

type TabType = 'account' | 'interface' | 'player' | 'profile'

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { success, error } = useToast()
  const { t, locale, setLocale } = useI18n()

  const [activeTab, setActiveTab] = useState<TabType>('account')
  const [loading, setLoading] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  // Profile fields
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [bio, setBio] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [hideHistory, setHideHistory] = useState(false)
  const [nsfwFilter, setNsfwFilter] = useState(true)
  const [cardSize, setCardSize] = useState('medium')

  // Player fields
  const [autoplay, setAutoplay] = useState(true)
  const [autoNext, setAutoNext] = useState(true)
  const [skipIntro, setSkipIntro] = useState(false)
  const [defaultSubLang, setDefaultSubLang] = useState('en')
  const [defaultQuality, setDefaultQuality] = useState('auto')

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Email change state
  const [newEmail, setNewEmail] = useState('')
  const [emailStep, setEmailStep] = useState<'idle' | 'code'>('idle')
  const [emailCode, setEmailCode] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)

  // Connected accounts & Sessions
  const [linkedProviders, setLinkedProviders] = useState<string[]>([])
  const [hasPassword, setHasPassword] = useState(true)
  const [sessionsCount, setSessionsCount] = useState(1)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings')
        if (res.ok) {
          const { settings } = await res.json()
          setUsername(settings.username || '')
          setEmail(settings.email || '')
          setBio(settings.bio || '')
          setIsPublic(settings.isPublic ?? true)
          setHideHistory(settings.hideHistory ?? false)
          setNsfwFilter(settings.nsfwFilter ?? true)
          setCardSize(settings.cardSize || 'medium')
          setAutoplay(settings.autoplay ?? true)
          setAutoNext(settings.autoNext ?? true)
          setSkipIntro(settings.skipIntro ?? false)
          setDefaultSubLang(settings.defaultSubLang || 'en')
          setDefaultQuality(settings.defaultQuality || 'auto')
        }
      } catch {}

      // Fetch accounts & sessions
      fetch('/api/settings/accounts')
        .then((r) => r.json())
        .then((d) => {
          if (d.accounts) setLinkedProviders(d.accounts)
          if (d.hasPassword !== undefined) setHasPassword(d.hasPassword)
        })
        .catch(() => {})

      fetch('/api/settings/sessions')
        .then((r) => r.json())
        .then((d) => {
          if (d.activeCount) setSessionsCount(d.activeCount)
        })
        .catch(() => {})
    }

    fetchSettings()
  }, [status, router])

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio,
          isPublic,
          hideHistory,
          nsfwFilter,
          cardSize,
          autoplay,
          autoNext,
          skipIntro,
          defaultSubLang,
          defaultQuality,
        }),
      })

      if (res.ok) {
        success('Preferences updated successfully')
      } else {
        error('Failed to update preferences')
      }
    } catch {
      error('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      error('Passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      error('Password must be at least 8 characters long')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/settings/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      })

      const data = await res.json()
      if (res.ok) {
        success('Password updated successfully')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setHasPassword(true)
      } else {
        error(data.error || 'Failed to update password')
      }
    } catch {
      error('Error updating password')
    } finally {
      setLoading(false)
    }
  }

  const handleRequestEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmail || newEmail === email) {
      error('Please enter a different email address')
      return
    }

    setEmailLoading(true)
    try {
      const res = await fetch('/api/settings/email/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail, locale }),
      })

      const data = await res.json()
      if (res.ok) {
        success('Confirmation code sent to your new email!')
        setEmailStep('code')
      } else {
        error(data.error || 'Failed to request email change')
      }
    } catch {
      error('Error requesting email change')
    } finally {
      setEmailLoading(false)
    }
  }

  const handleConfirmEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailCode) return

    setEmailLoading(true)
    try {
      const res = await fetch('/api/settings/email/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail, code: emailCode }),
      })

      const data = await res.json()
      if (res.ok) {
        success('Email updated successfully!')
        setEmail(newEmail)
        setNewEmail('')
        setEmailCode('')
        setEmailStep('idle')
      } else {
        error(data.error || 'Invalid code')
      }
    } catch {
      error('Error confirming email change')
    } finally {
      setEmailLoading(false)
    }
  }

  const handleUnlinkProvider = async (provider: string) => {
    if (!confirm(`Are you sure you want to unlink ${provider}?`)) return

    try {
      const res = await fetch(`/api/settings/accounts?provider=${provider}`, {
        method: 'DELETE',
      })

      const data = await res.json()
      if (res.ok) {
        success(`Unlinked ${provider}`)
        setLinkedProviders((prev) => prev.filter((p) => p !== provider))
      } else {
        error(data.error || `Failed to unlink ${provider}`)
      }
    } catch {
      error(`Error unlinking ${provider}`)
    }
  }

  const handleSignOutOthers = async () => {
    try {
      const res = await fetch('/api/settings/sessions', { method: 'POST' })
      if (res.ok) {
        success('Signed out of all other devices')
        setSessionsCount(1)
      } else {
        error('Failed to sign out other devices')
      }
    } catch {
      error('Error signing out devices')
    }
  }

  const handleDeleteAccount = async () => {
    try {
      const res = await fetch('/api/settings/delete-account', { method: 'DELETE' })
      if (res.ok) {
        signOut({ callbackUrl: '/' })
      }
    } catch {
      error('Failed to delete account')
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold font-heading text-[#d9d9de]">
          {t('settings.title')}
        </h1>
        <p className="text-xs text-[#8b8b94] mt-0.5">
          {t('settings.subtitle')}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#26262c] gap-1 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('account')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-medium rounded-t-[1px] transition-colors border-b-2 ${
            activeTab === 'account'
              ? 'border-[#a0a0b0] text-[#d9d9de] bg-[#111114]'
              : 'border-transparent text-[#8b8b94] hover:text-[#d9d9de]'
          }`}
        >
          <Shield size={14} />
          {t('settings.tab_account')}
        </button>

        <button
          onClick={() => setActiveTab('interface')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-medium rounded-t-[1px] transition-colors border-b-2 ${
            activeTab === 'interface'
              ? 'border-[#a0a0b0] text-[#d9d9de] bg-[#111114]'
              : 'border-transparent text-[#8b8b94] hover:text-[#d9d9de]'
          }`}
        >
          <Globe size={14} />
          {t('settings.tab_preferences')}
        </button>

        <button
          onClick={() => setActiveTab('player')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-medium rounded-t-[1px] transition-colors border-b-2 ${
            activeTab === 'player'
              ? 'border-[#a0a0b0] text-[#d9d9de] bg-[#111114]'
              : 'border-transparent text-[#8b8b94] hover:text-[#d9d9de]'
          }`}
        >
          <Tv size={14} />
          {t('settings.player_defaults')}
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-medium rounded-t-[1px] transition-colors border-b-2 ${
            activeTab === 'profile'
              ? 'border-[#a0a0b0] text-[#d9d9de] bg-[#111114]'
              : 'border-transparent text-[#8b8b94] hover:text-[#d9d9de]'
          }`}
        >
          <User size={14} />
          Profile
        </button>
      </div>

      {/* Tab 1: Account */}
      {activeTab === 'account' && (
        <div className="flex flex-col gap-6">
          {/* Email Management */}
          <div className="p-5 bg-[#111114] border border-[#26262c] rounded-[2px] flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#26262c]">
              <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-[#d9d9de] flex items-center gap-2">
                <Mail size={14} className="text-[#a0a0b0]" /> {t('settings.change_email')}
              </h3>
              <span className="text-[11px] font-mono text-[#8b8b94]">Current: {email}</span>
            </div>

            {emailStep === 'idle' ? (
              <form onSubmit={handleRequestEmailChange} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="Enter new email address..."
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                </div>
                <Button type="submit" variant="secondary" size="md" loading={emailLoading}>
                  Send Verification Code
                </Button>
              </form>
            ) : (
              <form onSubmit={handleConfirmEmailChange} className="flex flex-col gap-3">
                <p className="text-xs text-[#8b8b94]">
                  Confirmation code dispatched to <span className="text-[#a0a0b0] font-mono">{newEmail}</span>.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={emailCode}
                    onChange={(e) => setEmailCode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="6-digit code"
                    className="flex-1 text-center font-mono font-bold tracking-[6px] bg-[#17171b] border border-[#26262c] py-2 text-[#d9d9de] rounded-[1px]"
                  />
                  <Button type="submit" variant="primary" size="md" loading={emailLoading}>
                    Confirm Update
                  </Button>
                  <Button type="button" variant="ghost" size="md" onClick={() => setEmailStep('idle')}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Password Management */}
          <form onSubmit={handleChangePassword} className="p-5 bg-[#111114] border border-[#26262c] rounded-[2px] flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-[#d9d9de] pb-2 border-b border-[#26262c] flex items-center gap-2">
              <KeyRound size={14} className="text-[#a0a0b0]" /> {t('settings.change_password')}
            </h3>

            {hasPassword && (
              <Input
                label={t('settings.current_password')}
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t('auth.new_password')}
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Input
                label={t('auth.confirm_password')}
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {newPassword && <PasswordStrength password={newPassword} />}

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="secondary" size="md" loading={loading}>
                Save New Password
              </Button>
            </div>
          </form>

          {/* Connected Accounts */}
          <div className="p-5 bg-[#111114] border border-[#26262c] rounded-[2px] flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-[#d9d9de] pb-2 border-b border-[#26262c]">
              {t('settings.connected_accounts')}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {['google', 'github', 'discord'].map((provider) => {
                const isLinked = linkedProviders.includes(provider)
                return (
                  <div
                    key={provider}
                    className="p-3 bg-[#17171b] border border-[#26262c] rounded-[1px] flex items-center justify-between"
                  >
                    <span className="text-xs font-mono uppercase font-semibold text-[#d9d9de]">
                      {provider}
                    </span>
                    {isLinked ? (
                      <button
                        type="button"
                        onClick={() => handleUnlinkProvider(provider)}
                        className="text-[11px] font-mono text-[#c43c3c] hover:underline"
                      >
                        {t('settings.unlink')}
                      </button>
                    ) : (
                      <span className="text-[11px] font-mono text-[#56565e]">Not linked</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Active Sessions */}
          <div className="p-5 bg-[#111114] border border-[#26262c] rounded-[2px] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Laptop size={18} className="text-[#a0a0b0]" />
              <div>
                <h4 className="text-xs font-bold font-heading text-[#d9d9de]">{t('settings.active_devices')}</h4>
                <p className="text-[11px] font-mono text-[#8b8b94]">{sessionsCount} active web session(s)</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={handleSignOutOthers}>
              {t('settings.sign_out_others')}
            </Button>
          </div>

          {/* Danger Zone: Delete Account */}
          <div className="p-5 bg-[#c43c3c]/5 border border-[#c43c3c]/30 rounded-[2px] flex items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-[#c43c3c] font-heading">{t('settings.delete_account')}</h4>
              <p className="text-[11px] text-[#8b8b94] mt-0.5 max-w-lg">
                {t('settings.delete_account_warning')}
              </p>
            </div>
            <Button variant="danger" size="sm" onClick={() => setDeleteModalOpen(true)}>
              {t('common.delete')}
            </Button>
          </div>
        </div>
      )}

      {/* Tab 2: Interface & Preferences */}
      {activeTab === 'interface' && (
        <div className="flex flex-col gap-6">
          <div className="p-5 bg-[#111114] border border-[#26262c] rounded-[2px] flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-[#d9d9de] pb-2 border-b border-[#26262c] flex items-center gap-2">
              <Globe size={14} className="text-[#a0a0b0]" /> {t('settings.language')}
            </h3>

            <div className="grid grid-cols-3 gap-3">
              {[
                { code: 'en', label: 'English' },
                { code: 'uz', label: "O'zbek (lotin)" },
                { code: 'ru', label: 'Русский' },
              ].map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setLocale(item.code as Locale)}
                  className={`p-3 rounded-[1px] border text-left transition-colors font-mono text-xs ${
                    locale === item.code
                      ? 'bg-[#17171b] border-[#a0a0b0] text-[#d9d9de] font-bold'
                      : 'bg-[#111114] border-[#26262c] text-[#8b8b94] hover:text-[#d9d9de]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{item.label}</span>
                    {locale === item.code && <CheckCircle2 size={14} className="text-[#a0a0b0]" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSavePreferences} className="p-5 bg-[#111114] border border-[#26262c] rounded-[2px] flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-[#d9d9de] pb-2 border-b border-[#26262c]">
              Catalog Layout & Filtering
            </h3>

            <Select
              label="Card Size"
              value={cardSize}
              options={[
                { value: 'compact', label: 'Compact (Dense grid)' },
                { value: 'medium', label: 'Standard Medium' },
                { value: 'large', label: 'Large Cinematic' },
              ]}
              onChange={(val) => setCardSize(val as string)}
            />

            <Toggle
              label="NSFW / 18+ Content Filter"
              description="Filter out mature content from catalog, search, and recommendations"
              checked={nsfwFilter}
              onChange={setNsfwFilter}
            />

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" size="md" loading={loading} clipCorner>
                Save Interface Settings
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Player Defaults */}
      {activeTab === 'player' && (
        <form onSubmit={handleSavePreferences} className="p-5 bg-[#111114] border border-[#26262c] rounded-[2px] flex flex-col gap-6">
          <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-[#d9d9de] pb-2 border-b border-[#26262c]">
            {t('settings.player_defaults')}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label={t('settings.default_subtitles')}
              value={defaultSubLang}
              options={SUBTITLE_LANGUAGES.map((l) => ({ value: l.code, label: l.label }))}
              onChange={(val) => setDefaultSubLang(val as string)}
            />

            <Select
              label={t('settings.default_quality')}
              value={defaultQuality}
              options={QUALITY_OPTIONS}
              onChange={(val) => setDefaultQuality(val as string)}
            />
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Toggle
              label="Autoplay Video"
              description="Start playing automatically when opening a video player"
              checked={autoplay}
              onChange={setAutoplay}
            />
            <Toggle
              label="Auto-Next Episode"
              description="Automatically transition to next episode when current ends"
              checked={autoNext}
              onChange={setAutoNext}
            />
            <Toggle
              label={t('settings.skip_intro_auto')}
              description="Automatically skip opening sequences (+85 seconds)"
              checked={skipIntro}
              onChange={setSkipIntro}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" size="md" loading={loading} clipCorner>
              Save Player Preferences
            </Button>
          </div>
        </form>
      )}

      {/* Tab 4: Profile & Bio */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSavePreferences} className="p-5 bg-[#111114] border border-[#26262c] rounded-[2px] flex flex-col gap-6">
          <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-[#d9d9de] pb-2 border-b border-[#26262c]">
            Public Profile & Bio
          </h3>

          <Input label="Username" value={username} disabled />

          <Textarea
            label="Bio / About Me"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={500}
            showCount
            placeholder="Tell others about your favorite anime and donghua..."
          />

          <div className="flex flex-col gap-3 pt-2">
            <Toggle
              label="Public Profile"
              description="Allow other users to visit your profile and see your lists"
              checked={isPublic}
              onChange={setIsPublic}
            />
            <Toggle
              label="Hide Watch History"
              description="Keep your personal watch history hidden from your public profile"
              checked={hideHistory}
              onChange={setHideHistory}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" size="md" loading={loading} clipCorner>
              Save Profile
            </Button>
          </div>
        </form>
      )}

      {/* Confirm Account Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        title={t('settings.delete_account')}
        description={t('settings.delete_account_warning')}
        confirmText={t('settings.delete_account_confirm')}
        variant="danger"
      />
    </div>
  )
}
