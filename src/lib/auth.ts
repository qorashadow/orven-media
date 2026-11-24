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
if (!process.env.AUTH_URL && process.env.NEXTAUTH_URL) {
  process.env.AUTH_URL = process.env.NEXTAUTH_URL
}
if (!process.env.NEXTAUTH_URL && process.env.AUTH_URL) {
  process.env.NEXTAUTH_URL = process.env.AUTH_URL
}
if (!process.env.AUTH_URL && !process.env.NEXTAUTH_URL && process.env.NODE_ENV === 'production') {
  process.env.AUTH_URL = 'https://orven-media.vercel.app'
  process.env.NEXTAUTH_URL = 'https://orven-media.vercel.app'
}

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(db),
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
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? [
          GitHub({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    ...(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET
      ? [
          Discord({
            clientId: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
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
        const email = user.email?.toLowerCase()
        if (!email) return false

        const existingUser = await db.user.findUnique({
          where: { email },
        })

        if (!existingUser) {
          // Clean username generation for OAuth users
          const baseName = (user.name || email.split('@')[0])
            .toLowerCase()
            .replace(/[^a-zA-Z0-9_-]/g, '')
            .substring(0, 15)
          const username = `${baseName || 'user'}_${Math.random().toString(36).substring(2, 6)}`

          await db.user.create({
            data: {
              email,
              emailVerified: new Date(), // OAuth emails are pre-verified
              username,
              name: user.name || username,
              avatar: user.image,
              role: 'USER', // Always regular USER by default
            },
          })
        } else {
          // If existing user, ensure email is verified
          if (!existingUser.emailVerified) {
            await db.user.update({
              where: { id: existingUser.id },
              data: { emailVerified: new Date() },
            })
          }
        }

        const dbUser = await db.user.findUnique({
          where: { email },
        })

        if (dbUser?.banned) {
          return false
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
