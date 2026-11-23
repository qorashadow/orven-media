import React from 'react'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-[#0b0b0d] flex flex-col items-center justify-center p-4 relative">
      {/* Background radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(23,23,27,0.8)_0%,#0b0b0d_70%)] pointer-events-none" />

      {/* Brand logo at top */}
      <Link href="/" className="mb-6 flex items-center gap-2 group z-10">
        <div className="w-8 h-8 bg-[#a0a0b0] text-[#0b0b0d] font-bold text-sm flex items-center justify-center font-heading clip-corner-tr">
          OM
        </div>
        <span className="font-heading font-extrabold text-xl text-[#d9d9de] tracking-tight">
          ORVEN <span className="font-light text-[#8b8b94] tracking-widest">MEDIA</span>
        </span>
      </Link>

      {/* Main card */}
      <div className="relative w-full max-w-md bg-[#111114] border border-[#26262c] rounded-[2px] shadow-2xl p-6 sm:p-8 z-10">
        {children}
      </div>

      {/* Footer copyright */}
      <div className="mt-8 text-center text-[11px] font-mono text-[#56565e] z-10">
        &copy; {new Date().getFullYear()} Orven Media. All rights reserved.
      </div>
    </div>
  )
}
