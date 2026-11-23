import React from 'react'
import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-6">
      <div className="pb-4 border-b border-[#26262c]">
        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#d9d9de]">Terms of Service</h1>
        <p className="text-xs font-mono text-[#8b8b94] mt-1">Effective Date: November 2026 • Version 1.0.0</p>
      </div>

      {/* Portfolio Showcase Disclaimer Notice */}
      <div className="p-4 bg-[#a0a0b0]/10 border border-[#a0a0b0]/30 rounded-[2px] flex flex-col gap-2">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#a0a0b0]">
          Portfolio Demonstration & Fair Use Disclosure
        </h2>
        <p className="text-xs text-[#d9d9de] leading-relaxed">
          <strong>ORVEN MEDIA</strong> is a non-commercial, open portfolio engineering project built to demonstrate high-performance full-stack web architecture, video streaming engineering (HLS, chunked media streaming), multi-language localization (i18n), and contemporary UI/UX design. All streaming media utilized for interactive player testing are open-source and Creative Commons licensed (including open cinematic works by the <em>Blender Foundation</em>: <em>Big Buck Bunny</em>, <em>Sintel</em>, and <em>Tears of Steel</em>).
        </p>
      </div>

      <div className="p-6 bg-[#111114] border border-[#26262c] rounded-[2px] flex flex-col gap-6 text-xs text-[#8b8b94] leading-relaxed">
        <section>
          <h2 className="text-sm font-semibold font-heading text-[#d9d9de] mb-1.5">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the Orven Media website, progressive web application, or associated services (collectively, the &quot;Platform&quot;), you confirm that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree, you must cease all access to the Platform.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold font-heading text-[#d9d9de] mb-1.5">2. Intellectual Property & Third-Party Indexing</h2>
          <p>
            Orven Media functions as an informational indexing and community tracking catalog. Anime titles, synopsis summaries, character art, and metadata are programmatically retrieved via the open AniList GraphQL API under fair dealing principles. Orven Media does not assert ownership over any third-party intellectual property, trademarks, or production copyrights.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold font-heading text-[#d9d9de] mb-1.5">3. User Conduct & Community Standards</h2>
          <p>
            Users are permitted to create an account, compile personal watchlists, rate series, and post comments. When participating in community discussions, you agree to:
          </p>
          <ul className="list-disc pl-5 mt-2 flex flex-col gap-1 text-[#8b8b94]">
            <li>Strictly mark plot-revealing discussions with the built-in <strong>Spoiler Tag</strong>.</li>
            <li>Refrain from posting defamatory, offensive, harassing, or sexually explicit content.</li>
            <li>Refrain from automated scraping, DDoS attacks, or exploiting application rate limits.</li>
          </ul>
          <p className="mt-2">
            Violations of these guidelines will result in temporary suspension or permanent account termination.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold font-heading text-[#d9d9de] mb-1.5">4. Account Security</h2>
          <p>
            You are responsible for safeguarding your login credentials. Passwords must meet our minimum complexity standards (at least 8 characters with alphanumeric requirements) and are hashed using bcrypt. Orven Media supports multi-factor verification codes for email changes and password resets.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold font-heading text-[#d9d9de] mb-1.5">5. Modifications and Contact</h2>
          <p>
            We reserve the right to modify these Terms at any time. For questions regarding our Terms, please submit an inquiry via our <Link href="/contact" className="text-[#a0a0b0] hover:underline">Contact Page</Link>.
          </p>
        </section>
      </div>
    </div>
  )
}
