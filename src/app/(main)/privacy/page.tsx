import React from 'react'
import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-6">
      <div className="pb-4 border-b border-[#26262c]">
        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#d9d9de]">Privacy Policy</h1>
        <p className="text-xs font-mono text-[#8b8b94] mt-1">Effective Date: November 2026 • Version 1.0.0</p>
      </div>

      <div className="p-6 bg-[#111114] border border-[#26262c] rounded-[2px] flex flex-col gap-6 text-xs text-[#8b8b94] leading-relaxed">
        <section>
          <h2 className="text-sm font-semibold font-heading text-[#d9d9de] mb-1.5">1. Overview</h2>
          <p>
            Your privacy is fundamental to Orven Media. This Privacy Policy details how we handle user information, session state, and account security. We do not sell, rent, or monetize your personal data with third-party advertising brokers.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold font-heading text-[#d9d9de] mb-1.5">2. Information We Collect</h2>
          <p>We collect only the minimal data required to provide a seamless streaming and tracking experience:</p>
          <ul className="list-disc pl-5 mt-2 flex flex-col gap-1.5 text-[#8b8b94]">
            <li><strong>Account Data:</strong> Username, email address, and cryptographically hashed passwords (via bcrypt).</li>
            <li><strong>Watch State & Preferences:</strong> Watchlist statuses (Watching, Completed, Plan to watch), playback progress timestamps, player volume/speed preferences, and interface language selection (<code className="text-[#a0a0b0]">en</code>, <code className="text-[#a0a0b0]">uz</code>, or <code className="text-[#a0a0b0]">ru</code>).</li>
            <li><strong>OAuth Profiles:</strong> If you choose to log in via Google, GitHub, or Discord, we receive your email and public avatar strictly to establish your session.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-sm font-semibold font-heading text-[#d9d9de] mb-1.5">3. Cookies and Local Storage</h2>
          <p>
            Orven Media utilizes secure, HTTP-only cookies solely for user session persistence (<code className="text-[#a0a0b0]">authjs.session-token</code>) and user language preference (<code className="text-[#a0a0b0]">locale</code>). We do not deploy invasive third-party tracking beacons, cross-site trackers, or commercial advertising scripts.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold font-heading text-[#d9d9de] mb-1.5">4. Email Communications</h2>
          <p>
            We send transactional emails strictly for security and identity verification (e.g. 6-digit verification codes, password reset codes, and email change confirmations). You will never receive unsolicited marketing spam from Orven Media.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold font-heading text-[#d9d9de] mb-1.5">5. Data Retention & Account Deletion</h2>
          <p>
            Users have full sovereignty over their personal data under GDPR / CCPA principles. You can download or permanently delete your account, watch history, and comments at any time through <Link href="/settings" className="text-[#a0a0b0] hover:underline">Settings &gt; Account &gt; Delete Account</Link>. Deletion is immediate and irreversible.
          </p>
        </section>
      </div>
    </div>
  )
}
