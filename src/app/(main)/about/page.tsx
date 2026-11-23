import React from 'react'

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-6">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 bg-[#a0a0b0] text-[#0b0b0d] font-bold text-sm flex items-center justify-center font-heading clip-corner-tr">
          OM
        </div>
        <h1 className="text-2xl font-bold font-heading text-[#d9d9de]">About Orven Media</h1>
      </div>

      <div className="p-6 bg-[#111114] border border-[#26262c] rounded-[2px] flex flex-col gap-4 text-xs text-[#8b8b94] leading-relaxed">
        <p>
          <strong className="text-[#d9d9de]">Orven Media</strong> was conceived as a serious, angular, minimalist sanctuary for animation lovers. Frustrated by bloated video streaming sites with cluttered interfaces, distracting popups, and eye-straining colors, we built a cinematic platform that puts the content first.
        </p>

        <h3 className="text-sm font-semibold font-heading text-[#d9d9de] mt-2">Our Principles</h3>
        <ul className="list-disc pl-5 flex flex-col gap-1.5">
          <li>
            <strong className="text-[#d9d9de]">Dark & Sharp:</strong> Pure #0b0b0d deep blacks, thin 1px borders, crisp geometry. No eye fatigue.
          </li>
          <li>
            <strong className="text-[#d9d9de]">East Asian Animation Focused:</strong> We give Chinese Donghua the first-class spotlight it deserves alongside Japanese Anime.
          </li>
          <li>
            <strong className="text-[#d9d9de]">Powerful Controls:</strong> Instant keyboard shortcuts, HLS multi-bitrate streams, custom subtitle styling, and resume watching right where you left off.
          </li>
          <li>
            <strong className="text-[#d9d9de]">Community Driven:</strong> Discussion forums, ratings, watchlist tracking, and direct anime requests.
          </li>
        </ul>
      </div>
    </div>
  )
}
