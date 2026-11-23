import type { Metadata } from 'next'
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { SessionProvider } from 'next-auth/react'
import { auth } from '@/lib/auth'
import { ToastProvider } from '@/components/ui/Toast'
import { I18nProvider } from '@/context/I18nContext'
import { getServerLocale } from '@/lib/i18n'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Orven Media - Watch Anime & Donghua Online Free in HD',
    template: '%s | Orven Media',
  },
  description:
    'Watch free anime and donghua (Chinese animation) in ultra HD quality with multi-language subtitles. High-speed video player, schedules, and custom tracking on Orven Media.',
  keywords: [
    'anime',
    'donghua',
    'watch anime',
    'chinese animation',
    'orven media',
    'free anime hd',
    'subtitles',
    'stream anime',
  ],
  authors: [{ name: 'Orven Media Team' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Orven Media - Watch Anime & Donghua Online',
    description: 'High-speed anime & donghua streaming with multi-language subtitles.',
    siteName: 'Orven Media',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Orven Media',
    description: 'Watch Anime & Donghua Online Free in HD',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const locale = await getServerLocale()

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body
        suppressHydrationWarning
        className="font-[var(--font-body)] bg-[#0b0b0d] text-[#d9d9de] antialiased min-h-screen selection:bg-[#a0a0b0]/25 selection:text-[#d9d9de]"
      >
        <SessionProvider session={session}>
          <I18nProvider initialLocale={locale}>
            <ToastProvider>
              {children}
            </ToastProvider>
          </I18nProvider>
        </SessionProvider>
        <div className="film-grain" aria-hidden="true" />
      </body>
    </html>
  )
}
