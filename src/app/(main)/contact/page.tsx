'use client'

import React, { useState } from 'react'
import { Mail, Send } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { success } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSent(true)
      success('Your message has been dispatched to our team.')
    }, 600)
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-12 flex flex-col gap-6">
      <div className="text-center">
        <div className="w-12 h-12 rounded-[2px] bg-[#111114] border border-[#26262c] flex items-center justify-center text-[#a0a0b0] mx-auto mb-3">
          <Mail size={22} />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold font-heading text-[#d9d9de]">Contact Us</h1>
        <p className="text-xs text-[#8b8b94] mt-1">
          Have a partnership inquiry, technical issue, or feedback? Drop us a line.
        </p>
      </div>

      {sent ? (
        <div className="p-6 bg-[#111114] border border-[#3c8c5c]/40 rounded-[2px] text-center flex flex-col items-center gap-3">
          <span className="text-xs font-semibold text-[#3c8c5c]">Message sent!</span>
          <p className="text-xs text-[#8b8b94]">
            Thank you for reaching out. We will get back to you within 24-48 hours.
          </p>
          <Button variant="secondary" size="sm" onClick={() => setSent(false)}>
            Send Another Message
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 bg-[#111114] border border-[#26262c] rounded-[2px] flex flex-col gap-4">
          <Input
            label="Your Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
          />

          <Input
            label="Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
          />

          <Input
            label="Subject"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Inquiry subject"
          />

          <Textarea
            label="Message"
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={1000}
            showCount
            placeholder="Write your message here..."
          />

          <Button type="submit" variant="primary" size="md" loading={loading} clipCorner icon={<Send size={15} />}>
            Send Message
          </Button>
        </form>
      )}
    </div>
  )
}
