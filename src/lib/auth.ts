import NextAuth from 'next-auth'
import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import GitHub from 'next-auth/providers/github'
import Discord from 'next-auth/providers/discord'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcryptjs from 'bcryptjs'
import { db } from './db'

// Production & Vercel compatibility: harmonize secret and URL environment variables
const resolvedSecret =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  'orven-media-production-auth-secret-key-fallback-32b'

if (!process.env.AUTH_SECRET) {
  process.env.AUTH_SECRET = resolvedSecret
}
if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = resolvedSecret
}

// In production or Vercel, guarantee canonical production domain
if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
  if (!process.env.AUTH_URL || process.env.AUTH_URL.includes('localhost')) {
    process.env.AUTH_URL =
      process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost')
        ? process.env.NEXT_PUBLIC_APP_URL
        : 'https://orven-media.vercel.app'
  }
  if (!process.env.NEXTAUTH_URL || process.env.NEXTAUTH_URL.includes('localhost')) {
    process.env.NEXTAUTH_URL = process.env.AUTH_URL
  }
} else {
  if (!process.env.AUTH_URL && process.env.NEXTAUTH_URL) {
    process.env.AUTH_URL = process.env.NEXTAUTH_URL
  }
  if (!process.env.NEXTAUTH_URL && process.env.AUTH_URL) {
    process.env.NEXTAUTH_URL = process.env.AUTH_URL
  }
}

// Custom Prisma Adapter to satisfy required schema fields (username, avatar mapping) for OAuth
const basePrismaAdapter = PrismaAdapter(db)
const customPrismaAdapter: typeof basePrismaAdapter = {
  ...basePrismaAdapter,
  async createUser(data: any) {
    const email = (data.email || '').toLowerCase().trim()
    const baseName = (data.name || email.split('@')[0] || 'user')
      .toLowerCase()
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .substring(0, 15)
    const username = `${baseName || 'user'}_${Math.random().toString(36).substring(2, 7)}`

    return db.user.create({
      data: {
        name: data.name || username,
        email,
        username,
        avatar: data.image || null,
        emailVerified: data.emailVerified || new Date(),
        role: 'USER', // Newly registered OAuth users are always regular USERs
      },
    }) as any
  },
  async getUserByEmail(email: string) {
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })
    if (!user) return null
    return {
      ...user,
      image: user.avatar,
    } as any
  },
  async getUserByAccount({ provider, providerAccountId }: { provider: string; providerAccountId: string }) {
    const account = await db.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId,
        },
      },
      include: { user: true },
    })
    if (!account?.user) return null
    return {
      ...account.user,
      image: account.user.avatar,
    } as any
  },
}

const googleClientId = process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET
const githubClientId = process.env.GITHUB_CLIENT_ID || process.env.AUTH_GITHUB_ID
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET || process.env.AUTH_GITHUB_SECRET
const discordClientId = process.env.DISCORD_CLIENT_ID || process.env.AUTH_DISCORD_ID
const discordClientSecret = process.env.DISCORD_CLIENT_SECRET || process.env.AUTH_DISCORD_SECRET

export const authConfig: NextAuthConfig = {
  adapter: customPrismaAdapter,
  secret: resolvedSecret,
  trustHost: true,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/login',
    newUser: '/',
    error: '/auth/login',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email or Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
        remember: { label: 'Remember me', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const identifier = (credentials.email as string).trim().toLowerCase()
        const password = credentials.password as string

        // Find user by either email or username
        const user = await db.user.findFirst({
          where: {
            OR: [
              { email: identifier },
              { username: identifier },
            ],
          },
        })

        if (!user || !user.password) {
          return null
        }

        if (user.banned) {
          throw new Error('Your account has been banned.')
        }

        const isValidPassword = await bcryptjs.compare(password, user.password)
        if (!isValidPassword) {
          return null
        }

        if (!user.emailVerified) {
          throw new Error('Please verify your email address before logging in.')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name || user.username,
          image: user.avatar,
          role: user.role,
          username: user.username,
        } as any
      },
    }),
    ...(googleClientId && googleClientSecret
      ? [
          Google({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    ...(githubClientId && githubClientSecret
      ? [
          GitHub({
            clientId: githubClientId,
            clientSecret: githubClientSecret,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    ...(discordClientId && discordClientSecret
      ? [
          Discord({
            clientId: discordClientId,
            clientSecret: discordClientSecret,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        if (user.id) token.id = user.id
        token.role = (user as any).role || 'USER'
        token.username = (user as any).username || ''
        token.avatar = (user as any).image || null

        const dbUser = await db.user.findUnique({
          where: { email: user.email! },
          select: {
            id: true,
            username: true,
            role: true,
            avatar: true,
            banned: true,
            emailVerified: true,
            language: true,
          },
        }).catch(() => null)

        if (dbUser) {
          token.id = dbUser.id
          token.username = dbUser.username
          token.role = dbUser.role
          token.avatar = dbUser.avatar
          token.banned = dbUser.banned
          token.emailVerified = dbUser.emailVerified
          token.language = dbUser.language
        }
      }

      if (trigger === 'update' && session) {
        token.username = session.username || token.username
        token.avatar = session.avatar || token.avatar
        token.name = session.name || token.name
        if (session.language) token.language = session.language
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.username = token.username as string
        session.user.role = token.role as string
        session.user.image = token.avatar as string | null
        ;(session.user as any).emailVerified = token.emailVerified as Date | null
        ;(session.user as any).language = token.language as string | null
      }
      return session
    },
    async signIn({ user, account }) {
      if (account?.provider && account.provider !== 'credentials') {
        const email = user.email?.toLowerCase().trim()
        if (!email) return false

        const dbUser = await db.user.findUnique({
          where: { email },
        })

        if (dbUser?.banned) {
          return false
        }

        if (dbUser && !dbUser.emailVerified) {
          await db.user.update({
            where: { id: dbUser.id },
            data: { emailVerified: new Date() },
          })
        }
      }
      return true
    },
  },
  events: {
    async signIn({ user }) {
      if (user.id) {
        await db.user.update({
          where: { id: user.id },
          data: { updatedAt: new Date() },
        }).catch(() => {})
      }
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
