import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
})

export const registerSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const animeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  titleEnglish: z.string().max(500).optional().nullable(),
  titleNative: z.string().max(500).optional().nullable(),
  titleRomaji: z.string().max(500).optional().nullable(),
  synopsis: z.string().max(10000).optional().nullable(),
  poster: z.string().optional().nullable(),
  banner: z.string().optional().nullable(),
  trailer: z.string().url().optional().nullable().or(z.literal('')),
  type: z.enum(['TV', 'MOVIE', 'OVA', 'ONA', 'SPECIAL']).default('TV'),
  category: z.enum(['ANIME', 'DONGHUA']).default('ANIME'),
  status: z.enum(['AIRING', 'COMPLETED', 'UPCOMING', 'HIATUS']).default('UPCOMING'),
  season: z.enum(['WINTER', 'SPRING', 'SUMMER', 'FALL']).optional().nullable(),
  year: z.number().int().min(1900).max(2100).optional().nullable(),
  totalEpisodes: z.number().int().min(0).optional().nullable(),
  duration: z.number().int().min(0).optional().nullable(),
  ageRating: z.string().optional().nullable(),
  averageScore: z.number().min(0).max(100).optional().nullable(),
  isNSFW: z.boolean().default(false),
  genreIds: z.array(z.string()).optional(),
  studioIds: z.array(z.string()).optional(),
})

export const episodeSchema = z.object({
  number: z.number().int().min(1, 'Episode number is required'),
  title: z.string().max(500).optional().nullable(),
  thumbnail: z.string().optional().nullable(),
  duration: z.number().int().min(0).optional().nullable(),
  videoUrl: z.string().optional().nullable(),
  videoType: z.enum(['mp4', 'hls']).default('mp4'),
  introStart: z.number().int().min(0).optional().nullable(),
  introEnd: z.number().int().min(0).optional().nullable(),
  outroStart: z.number().int().min(0).optional().nullable(),
  filler: z.boolean().default(false),
  recap: z.boolean().default(false),
  aired: z.string().optional().nullable(),
})

export const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(2000, 'Comment is too long'),
  animeId: z.string().optional().nullable(),
  episodeId: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
  isSpoiler: z.boolean().default(false),
})

export const ratingSchema = z.object({
  animeId: z.string().min(1),
  score: z.number().int().min(1).max(10),
})

export const reviewSchema = z.object({
  animeId: z.string().min(1),
  title: z.string().min(1).max(200),
  content: z.string().min(50, 'Review must be at least 50 characters').max(5000),
  score: z.number().int().min(1).max(10),
})

export const profileSchema = z.object({
  name: z.string().max(50).optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  avatar: z.string().optional().nullable(),
  banner: z.string().optional().nullable(),
})

export const settingsSchema = z.object({
  username: z.string().min(3).max(20).optional(),
  email: z.string().email().optional(),
  isPublic: z.boolean().optional(),
  hideHistory: z.boolean().optional(),
  nsfwFilter: z.boolean().optional(),
  language: z.enum(['en', 'uz', 'ru']).optional(),
  cardSize: z.enum(['small', 'medium', 'large']).optional(),
  autoplay: z.boolean().optional(),
  autoNext: z.boolean().optional(),
  skipIntro: z.boolean().optional(),
  defaultSubLang: z.string().optional(),
  defaultQuality: z.string().optional(),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const reportSchema = z.object({
  type: z.enum(['BROKEN_VIDEO', 'COMMENT', 'OTHER']),
  reason: z.string().min(1).max(500),
  details: z.string().max(2000).optional(),
  commentId: z.string().optional(),
})

export const requestSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  details: z.string().max(1000).optional(),
})

export const searchSchema = z.object({
  q: z.string().min(1).max(200),
  type: z.enum(['TV', 'MOVIE', 'OVA', 'ONA', 'SPECIAL']).optional(),
  category: z.enum(['ANIME', 'DONGHUA']).optional(),
  genre: z.string().optional(),
  year: z.number().int().optional(),
  status: z.enum(['AIRING', 'COMPLETED', 'UPCOMING', 'HIATUS']).optional(),
  sort: z.enum(['popular', 'newest', 'score', 'az', 'updated']).optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(50).optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type AnimeInput = z.infer<typeof animeSchema>
export type EpisodeInput = z.infer<typeof episodeSchema>
export type CommentInput = z.infer<typeof commentSchema>
export type RatingInput = z.infer<typeof ratingSchema>
export type ReviewInput = z.infer<typeof reviewSchema>
export type ProfileInput = z.infer<typeof profileSchema>
export type SettingsInput = z.infer<typeof settingsSchema>
export type ReportInput = z.infer<typeof reportSchema>
export type RequestInput = z.infer<typeof requestSchema>
export type SearchInput = z.infer<typeof searchSchema>
