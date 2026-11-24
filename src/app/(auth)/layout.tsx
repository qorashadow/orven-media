import React from 'react'
import Link from 'next/link'
import { BackToHome } from '@/components/auth/BackToHome'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen h-screen w-full bg-[#0b0b0d] flex flex-col items-center justify-center p-3 sm:p-4 relative overflow-y-auto">
      {/* Background radial gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(23,23,27,0.8)_0%,#0b0b0d_70%)] pointer-events-none" />

      {/* Back to Home Button */}
      <BackToHome />

      {/* Brand logo at top */}
      <Link href="/" className="mb-2.5 sm:mb-3 flex items-center gap-2 group z-10 shrink-0">
        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#a0a0b0] text-[#0b0b0d] font-bold text-xs sm:text-sm flex items-center justify-center font-heading clip-corner-tr">
          OM
        </div>
        <span className="font-heading font-extrabold text-lg sm:text-xl text-[#d9d9de] tracking-tight">
          ORVEN <span className="font-light text-[#8b8b94] tracking-widest">MEDIA</span>
        </span>
      </Link>

      {/* Main card */}
      <div className="relative w-full max-w-[420px] bg-[#111114] border border-[#26262c] rounded-[2px] shadow-2xl p-4 sm:p-5 z-10 my-auto sm:my-0">
        {children}
      </div>

      {/* Footer copyright */}
      <div className="mt-2 sm:mt-2.5 text-center text-[10px] font-mono text-[#56565e] z-10 shrink-0">
        &copy; {new Date().getFullYear()} Orven Media. All rights reserved.
      </div>
    </div>
  )
}
