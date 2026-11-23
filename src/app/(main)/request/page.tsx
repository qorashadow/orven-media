'use client'

import React, { useState } from 'react'
import { Inbox, Send } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function RequestPage() {
  const [title, setTitle] = useState('')
  const [details, setDetails] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { data: session } = useSession()
  const { success, error } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user) {
      error('Please sign in to submit a request')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, details }),
      })

      if (res.ok) {
        setSubmitted(true)
        success('Request submitted!')
        setTitle('')
        setDetails('')
      } else {
        error('Failed to submit request')
      }
    } catch {
      error('Error submitting request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-12 flex flex-col gap-6">
      <div className="text-center">
        <div className="w-12 h-12 rounded-[2px] bg-[#111114] border border-[#26262c] flex items-center justify-center text-[#a0a0b0] mx-auto mb-3">
          <Inbox size={22} />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold font-heading text-[#d9d9de]">
          Request Anime or Donghua
        </h1>
        <p className="text-xs text-[#8b8b94] mt-1 max-w-sm mx-auto">
          Can&apos;t find a series you want to watch? Let us know and our team will add it.
        </p>
      </div>

      {!session?.user ? (
        <div className="p-6 bg-[#111114] border border-[#26262c] rounded-[2px] text-center text-xs text-[#8b8b94]">
          You need an account to request titles.{' '}
          <Link href="/auth/login" className="text-[#a0a0b0] font-bold hover:underline">
            Sign in
          </Link>{' '}
          or{' '}
          <Link href="/auth/register" className="text-[#a0a0b0] font-bold hover:underline">
            Register
          </Link>
          .
        </div>
      ) : submitted ? (
        <div className="p-6 bg-[#111114] border border-[#3c8c5c]/40 rounded-[2px] text-center flex flex-col items-center gap-3">
          <div className="text-xs font-semibold text-[#3c8c5c]">
            Request successfully submitted!
          </div>
          <p className="text-xs text-[#8b8b94]">
            Our administrators review new requests regularly. You will receive a notification once it is added.
          </p>
          <Button variant="secondary" size="sm" onClick={() => setSubmitted(false)}>
            Submit Another Request
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 bg-[#111114] border border-[#26262c] rounded-[2px] flex flex-col gap-4">
          <Input
            label="Anime / Donghua Title"
            placeholder="e.g. Solo Leveling Season 2"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Textarea
            label="Additional Details (Optional)"
            placeholder="Release year, season number, or specific studio info..."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            maxLength={500}
            showCount
          />

          <Button type="submit" variant="primary" size="md" loading={loading} clipCorner icon={<Send size={15} />}>
            Submit Request
          </Button>
        </form>
      )}
    </div>
  )
}
