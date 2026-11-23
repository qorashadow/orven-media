import React from 'react'
import { HelpCircle } from 'lucide-react'

export default function FAQPage() {
  const faqs = [
    {
      q: 'What is Orven Media?',
      a: 'Orven Media is an ultra-fast, minimalist anime and donghua (Chinese animation) streaming website with multi-language subtitle support, personal watchlist tracking, and community discussion features.',
    },
    {
      q: 'Is Orven Media completely free?',
      a: 'Yes, watching anime and donghua on Orven Media is 100% free with no hidden subscription fees.',
    },
    {
      q: 'How do I use keyboard shortcuts in the video player?',
      a: 'While watching, press Space to Play/Pause, F for Fullscreen, M to Mute, Left/Right arrows for 5-second skips, J/L for 10-second skips, T for Theater Mode, and N/P for Next/Previous episodes.',
    },
    {
      q: 'What is Donghua?',
      a: 'Donghua refers to Chinese animation produced in China. Many popular 3D and 2D cultivation and fantasy series like Soul Land, Battle Through the Heavens, and Link Click are Donghua.',
    },
    {
      q: 'Can I request an anime that is not on the site?',
      a: 'Yes! Simply head over to our "Request Anime" page and submit the title. Our admin team will import and publish it.',
    },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
      <div className="flex items-center gap-3 pb-4 border-b border-[#26262c]">
        <HelpCircle size={22} className="text-[#a0a0b0]" />
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-[#d9d9de]">
            Frequently Asked Questions
          </h1>
          <p className="text-xs text-[#8b8b94] mt-0.5">
            Answers to common questions about Orven Media and video playback.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="p-4 bg-[#111114] border border-[#26262c] rounded-[2px] flex flex-col gap-2"
          >
            <h3 className="text-sm font-semibold text-[#d9d9de] font-heading">{faq.q}</h3>
            <p className="text-xs text-[#8b8b94] leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
