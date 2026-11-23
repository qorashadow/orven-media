export interface AnimeCard {
  id: string
  title: string
  titleEnglish: string | null
  slug: string
  poster: string | null
  type: string
  category: string
  status: string
  totalEpisodes: number | null
  averageScore: number | null
  year: number | null
  genres: { genre: { name: string; slug: string } }[]
}

export interface AnimeDetail extends AnimeCard {
  titleNative: string | null
  titleRomaji: string | null
  synopsis: string | null
  banner: string | null
  trailer: string | null
  season: string | null
  duration: number | null
  ageRating: string | null
  popularity: number
  favorites: number
  views: number
  isNSFW: boolean
  studios: { studio: { id: string; name: string; slug: string } }[]
  episodes: EpisodeItem[]
  characters: {
    character: { id: string; name: string; nameNative: string | null; image: string | null }
    role: string
  }[]
  relations: {
    target: AnimeCard
    relationType: string
  }[]
  _count: {
    episodes: number
    comments: number
    ratings: number
    favoritedBy: number
  }
}

export interface EpisodeItem {
  id: string
  number: number
  title: string | null
  thumbnail: string | null
  duration: number | null
  videoUrl: string | null
  videoType: string
  filler: boolean
  recap: boolean
  aired: string | null
  introStart: number | null
  introEnd: number | null
  outroStart: number | null
  subtitles: SubtitleItem[]
  servers: VideoServerItem[]
}

export interface SubtitleItem {
  id: string
  language: string
  label: string
  url: string
  isDefault: boolean
}

export interface VideoServerItem {
  id: string
  name: string
  url: string
  type: string
  quality: string
  language: string
  isDefault: boolean
}

export interface UserProfile {
  id: string
  username: string
  name: string | null
  avatar: string | null
  banner: string | null
  bio: string | null
  role: string
  isPublic: boolean
  hideHistory: boolean
  createdAt: string
  _count: {
    watchHistory: number
    watchlist: number
    favorites: number
    comments: number
    reviews: number
  }
}

export interface WatchHistoryItem {
  id: string
  progress: number
  duration: number
  completed: boolean
  watchedAt: string
  anime: AnimeCard
  episode: { id: string; number: number; title: string | null }
}

export interface WatchlistItem {
  id: string
  status: string
  episodesWatched: number
  updatedAt: string
  anime: AnimeCard
}

export interface NotificationItem {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  read: boolean
  createdAt: string
  anime: AnimeCard | null
}

export interface CommentItem {
  id: string
  content: string
  isSpoiler: boolean
  isEdited: boolean
  createdAt: string
  user: {
    id: string
    username: string
    avatar: string | null
  }
  _count: {
    likes: number
    replies: number
  }
  likes: { isLike: boolean }[]
  replies?: CommentItem[]
  userLike?: { isLike: boolean } | null
  likesCount: number
  dislikesCount: number
}

export interface ScheduleItem {
  id: string
  episodeNumber: number
  airingAt: string
  anime: AnimeCard
}

export interface SearchSuggestion {
  id: string
  title: string
  titleEnglish: string | null
  poster: string | null
  type: string
  year: number | null
  slug: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface FilterState {
  type?: string[]
  category?: string
  genre?: string[]
  year?: number
  season?: string
  status?: string
  sort?: string
  page?: number
  q?: string
}

export interface AdminStats {
  totalUsers: number
  totalAnime: number
  totalViews: number
  activeToday: number
  topAnime: { title: string; views: number }[]
  recentActivity: {
    action: string
    target: string
    createdAt: string
  }[]
}
