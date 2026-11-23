import React from 'react'
import Link from 'next/link'

export default function DMCAPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-6">
      <div className="pb-4 border-b border-[#26262c]">
        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#d9d9de]">DMCA Copyright Policy & Notice</h1>
        <p className="text-xs font-mono text-[#8b8b94] mt-1">Digital Millennium Copyright Act Compliance • 17 U.S.C. § 512</p>
      </div>

      {/* Non-hosting statement */}
      <div className="p-4 bg-[#111114] border border-[#26262c] rounded-[2px] flex flex-col gap-2">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#d9d9de]">
          Zero-Storage & External Aggregation Policy
        </h2>
        <p className="text-xs text-[#8b8b94] leading-relaxed">
          <strong>ORVEN MEDIA</strong> does not host, upload, store, or manage any copyrighted video files or media streams on its internal storage infrastructure. The platform operates strictly as an indexer and catalog application. Media previews and player verification utilize open-source animations provided under Creative Commons licensing by the <em>Blender Foundation</em> (e.g., <em>Big Buck Bunny</em>, <em>Sintel</em>, <em>Tears of Steel</em>).
        </p>
      </div>

      <div className="p-6 bg-[#111114] border border-[#26262c] rounded-[2px] flex flex-col gap-6 text-xs text-[#8b8b94] leading-relaxed">
        <section>
          <h2 className="text-sm font-semibold font-heading text-[#d9d9de] mb-1.5">1. Notice and Takedown Procedure</h2>
          <p>
            Orven Media respects the intellectual property rights of creators and content distributors worldwide. In accordance with Title 17 of the United States Code, Section 512(c)(3), copyright owners or designated agents may submit formal takedown notices regarding any metadata or indexed links.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold font-heading text-[#d9d9de] mb-1.5">2. Required Takedown Information</h2>
          <p>To expedite review, an infringement notification must include the following details:</p>
          <ul className="list-disc pl-5 mt-2 flex flex-col gap-1.5 text-[#8b8b94]">
            <li>A physical or electronic signature of a person authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.</li>
            <li>Clear identification of the copyrighted work claimed to have been infringed.</li>
            <li>Specific URLs on Orven Media containing the alleged indexed material.</li>
            <li>Contact details of the complaining party (including name, physical address, telephone number, and email address).</li>
            <li>A statement that the complaining party has a good-faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.</li>
            <li>A statement that the information in the notification is accurate, and under penalty of perjury, that the complaining party is authorized to act on behalf of the copyright owner.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-sm font-semibold font-heading text-[#d9d9de] mb-1.5">3. Submission & Response Time</h2>
          <p>
            Please direct all legal DMCA notices directly to our compliance desk via our <Link href="/contact" className="text-[#a0a0b0] hover:underline">Contact Form</Link>. Valid and complete notices are reviewed and actioned within 24 to 48 business hours.
          </p>
        </section>
      </div>
    </div>
  )
}
