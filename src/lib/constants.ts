export const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror',
  'Mecha', 'Music', 'Mystery', 'Psychological', 'Romance', 'Sci-Fi',
  'Slice of Life', 'Sports', 'Supernatural', 'Thriller', 'Isekai',
  'Martial Arts', 'Historical', 'Ecchi',
] as const

export const ANIME_TYPES = ['TV', 'MOVIE', 'OVA', 'ONA', 'SPECIAL'] as const
export const CATEGORIES = ['ANIME', 'DONGHUA'] as const
export const STATUSES = ['AIRING', 'COMPLETED', 'UPCOMING', 'HIATUS'] as const
export const SEASONS = ['WINTER', 'SPRING', 'SUMMER', 'FALL'] as const
export const AGE_RATINGS = ['G', 'PG', 'PG13', 'R', 'R17', 'R18'] as const

export const WATCHLIST_STATUSES = [
  { value: 'WATCHING', label: 'Watching', icon: '▶' },
  { value: 'PLAN_TO_WATCH', label: 'Plan to Watch', icon: '📋' },
  { value: 'COMPLETED', label: 'Completed', icon: '✓' },
  { value: 'ON_HOLD', label: 'On Hold', icon: '⏸' },
  { value: 'DROPPED', label: 'Dropped', icon: '✕' },
] as const

export const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest' },
  { value: 'score', label: 'Highest Score' },
  { value: 'az', label: 'A-Z' },
  { value: 'updated', label: 'Recently Updated' },
  { value: 'trending', label: 'Trending' },
] as const

export const LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'uz', label: 'Uzbek', nativeLabel: "O'zbek" },
  { code: 'ru', label: 'Russian', nativeLabel: 'Русский' },
] as const

export const SUBTITLE_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'uz', label: "O'zbek" },
  { code: 'ru', label: 'Русский' },
  { code: 'ja', label: '日本語' },
  { code: 'zh', label: '中文' },
  { code: 'ko', label: '한국어' },
] as const

export const PLAYER_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const

export const QUALITY_OPTIONS = [
  { value: 'auto', label: 'Auto' },
  { value: '1080', label: '1080p' },
  { value: '720', label: '720p' },
  { value: '480', label: '480p' },
  { value: '360', label: '360p' },
] as const

export const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: 'home' },
  { href: '/anime', label: 'Anime', icon: 'tv' },
  { href: '/donghua', label: 'Donghua', icon: 'film' },
  { href: '/movies', label: 'Movies', icon: 'clapperboard' },
  { href: '/schedule', label: 'Schedule', icon: 'calendar' },
  { href: '/genres', label: 'Genres', icon: 'tag' },
  { href: '/top', label: 'Top', icon: 'trophy' },
  { href: '/random', label: 'Random', icon: 'shuffle' },
] as const

export const MOBILE_NAV_ITEMS = [
  { href: '/', label: 'Home', icon: 'home' },
  { href: '/browse', label: 'Browse', icon: 'compass' },
  { href: '/search', label: 'Search', icon: 'search' },
  { href: '/schedule', label: 'Schedule', icon: 'calendar' },
  { href: '/profile', label: 'Profile', icon: 'user' },
] as const

export const ADMIN_NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: 'layout-dashboard' },
  { href: '/admin/anime', label: 'Anime', icon: 'tv' },
  { href: '/admin/users', label: 'Users', icon: 'users' },
  { href: '/admin/comments', label: 'Comments', icon: 'message-square' },
  { href: '/admin/reports', label: 'Reports', icon: 'flag' },
  { href: '/admin/requests', label: 'Requests', icon: 'inbox' },
  { href: '/admin/spotlight', label: 'Spotlight', icon: 'star' },
  { href: '/admin/schedule', label: 'Schedule', icon: 'calendar' },
  { href: '/admin/announcements', label: 'Announcements', icon: 'megaphone' },
  { href: '/admin/news', label: 'News', icon: 'newspaper' },
  { href: '/admin/settings', label: 'Settings', icon: 'settings' },
  { href: '/admin/audit-log', label: 'Audit Log', icon: 'scroll-text' },
] as const

export const KEYBOARD_SHORTCUTS = {
  PLAY_PAUSE: ' ',
  FULLSCREEN: 'f',
  MUTE: 'm',
  SEEK_BACK_5: 'ArrowLeft',
  SEEK_FORWARD_5: 'ArrowRight',
  SEEK_BACK_10: 'j',
  SEEK_FORWARD_10: 'l',
  VOLUME_UP: 'ArrowUp',
  VOLUME_DOWN: 'ArrowDown',
  NEXT_EPISODE: 'n',
  PREV_EPISODE: 'p',
  PIP: 'i',
  THEATER: 't',
  ESCAPE: 'Escape',
} as const

export const FILE_LIMITS = {
  VIDEO_MAX_SIZE: 500 * 1024 * 1024, // 500MB
  IMAGE_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  SUBTITLE_MAX_SIZE: 2 * 1024 * 1024, // 2MB
  AVATAR_MAX_SIZE: 2 * 1024 * 1024, // 2MB
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'application/x-mpegURL', 'video/MP2T'],
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  ALLOWED_SUBTITLE_TYPES: ['text/vtt', 'application/x-subrip', 'text/plain'],
} as const

export const RATE_LIMITS = {
  AUTH: { maxAttempts: 5, windowMs: 15 * 60 * 1000 },
  API: { maxAttempts: 100, windowMs: 60 * 1000 },
  UPLOAD: { maxAttempts: 10, windowMs: 60 * 1000 },
  COMMENT: { maxAttempts: 10, windowMs: 60 * 1000 },
  SEARCH: { maxAttempts: 30, windowMs: 60 * 1000 },
} as const

export const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
] as const

export const RELATION_TYPES = [
  { value: 'SEQUEL', label: 'Sequel' },
  { value: 'PREQUEL', label: 'Prequel' },
  { value: 'SIDE_STORY', label: 'Side Story' },
  { value: 'PARENT', label: 'Parent' },
  { value: 'ALTERNATIVE', label: 'Alternative' },
  { value: 'SPIN_OFF', label: 'Spin Off' },
  { value: 'SUMMARY', label: 'Summary' },
  { value: 'OTHER', label: 'Other' },
] as const

export const CHARACTER_ROLES = [
  { value: 'MAIN', label: 'Main' },
  { value: 'SUPPORTING', label: 'Supporting' },
  { value: 'BACKGROUND', label: 'Background' },
] as const
