import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

export function formatTimestamp(seconds: number): string {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

export function formatTimeAgo(date: Date | string): string {
  const now = new Date()
  const d = new Date(date)
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`
  return formatDate(d)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

export function getBaseUrl(): string {
  // 1. Explicit public app URL if defined and not localhost
  const publicUrl = process.env.NEXT_PUBLIC_APP_URL
  if (publicUrl && !publicUrl.includes('localhost')) {
    return publicUrl.replace(/\/+$/, '')
  }

  // 2. Client-side browser origin
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin
  }

  // 3. NextAuth or Auth URL if not localhost
  const authUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL
  if (authUrl && !authUrl.includes('localhost')) {
    return authUrl.replace(/\/+$/, '')
  }

  // 4. Vercel deployment URLs (provided automatically in Vercel environment)
  const vercelProjectUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  if (vercelProjectUrl) {
    return `https://${vercelProjectUrl.replace(/\/+$/, '')}`
  }
  const vercelUrl = process.env.VERCEL_URL
  if (vercelUrl) {
    return `https://${vercelUrl.replace(/\/+$/, '')}`
  }

  // 5. Use publicUrl or authUrl even if localhost (for local development)
  if (publicUrl) {
    return publicUrl.replace(/\/+$/, '')
  }
  if (authUrl) {
    return authUrl.replace(/\/+$/, '')
  }

  // 6. Production fallback default (never return localhost in production)
  if (process.env.NODE_ENV === 'production') {
    return 'https://orven-media.vercel.app'
  }

  // 7. Local development fallback
  return 'http://localhost:3000'
}

export function getImageUrl(path: string | null | undefined): string {
  if (!path) return '/placeholder.jpg'
  if (path.startsWith('http')) return path
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return cleanPath
}

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => { inThrottle = false }, limit)
    }
  }
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-success'
  if (score >= 60) return 'text-warning'
  return 'text-danger'
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim()
}

export function getSeasonLabel(season: string): string {
  const labels: Record<string, string> = {
    WINTER: 'Winter',
    SPRING: 'Spring',
    SUMMER: 'Summer',
    FALL: 'Fall',
  }
  return labels[season] || season
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    AIRING: 'Airing',
    COMPLETED: 'Completed',
    UPCOMING: 'Upcoming',
    HIATUS: 'Hiatus',
  }
  return labels[status] || status
}

export function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    TV: 'TV',
    MOVIE: 'Movie',
    OVA: 'OVA',
    ONA: 'ONA',
    SPECIAL: 'Special',
  }
  return labels[type] || type
}
