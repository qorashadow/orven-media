import { NextResponse } from 'next/server'
import crypto from 'crypto'
import bcryptjs from 'bcryptjs'
import { db } from '@/lib/db'
import { registerSchema } from '@/lib/validations'
import { checkRateLimit, getRateLimitKey } from '@/lib/rate-limit'
import { RATE_LIMITS } from '@/lib/constants'
import { sendVerificationEmail, type EmailLocale } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1'
    const limitKey = getRateLimitKey(ip, 'register')
    const rateCheck = checkRateLimit(limitKey, RATE_LIMITS.AUTH)
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await req.json()
    const locale: EmailLocale = body.locale && ['en', 'uz', 'ru'].includes(body.locale) ? body.locale : 'en'

    const validation = registerSchema.safeParse(body)
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'Validation failed'
      return NextResponse.json({ error: firstError }, { status: 400 })
    }

    const { username, email, password } = validation.data
    const normalizedEmail = email.toLowerCase().trim()
    const normalizedUsername = username.toLowerCase().trim()

    // 1. Check duplicate email among verified or protected (ADMIN/MODERATOR) accounts
    const protectedEmailUser = await db.user.findFirst({
      where: {
        email: normalizedEmail,
        OR: [
          { emailVerified: { not: null } },
          { role: { in: ['ADMIN', 'MODERATOR'] } },
        ],
      },
    })
    if (protectedEmailUser) {
      return NextResponse.json({ error: 'Email address is already in use' }, { status: 409 })
    }

    // 2. Check duplicate username among verified or protected accounts
    const protectedUsernameUser = await db.user.findFirst({
      where: {
        username: normalizedUsername,
        OR: [
          { emailVerified: { not: null } },
          { role: { in: ['ADMIN', 'MODERATOR'] } },
        ],
      },
    })
    if (protectedUsernameUser) {
      return NextResponse.json({ error: 'Username is already taken' }, { status: 409 })
    }

    // 3. Clean up unverified collisions from earlier abandoned or in-flight attempts
    // Any unverified USER record with the same email or username is safely released/replaced
    const unverifiedCollisions = await db.user.findMany({
      where: {
        role: 'USER',
        emailVerified: null,
        OR: [
          { email: normalizedEmail },
          { username: normalizedUsername },
        ],
      },
    })

    for (const collision of unverifiedCollisions) {
      await db.verificationToken.deleteMany({
        where: { identifier: `verify:${collision.email}` },
      }).catch(() => {})

      await db.session.deleteMany({ where: { userId: collision.id } }).catch(() => {})
      await db.account.deleteMany({ where: { userId: collision.id } }).catch(() => {})
      await db.user.delete({ where: { id: collision.id } }).catch(() => {})
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10)

    // Registered users are always given the 'USER' role for security.
    // Admin access must only be assigned explicitly through database seeding or existing admins.
    const role = 'USER'

    const user = await db.user.create({
      data: {
        username: normalizedUsername,
        email: normalizedEmail,
        password: hashedPassword,
        name: username,
        role,
        emailVerified: null, // Unverified until code confirmed
        language: locale,
      },
    })

    // Generate cryptographically secure 6-digit confirmation code
    const code = crypto.randomInt(100000, 1000000).toString()
    const hashedCode = await bcryptjs.hash(code, 10)

    // Clean up old token if any
    await db.verificationToken.deleteMany({
      where: { identifier: `verify:${normalizedEmail}` },
    }).catch(() => {})

    // Store token valid for 10 minutes
    await db.verificationToken.create({
      data: {
        identifier: `verify:${normalizedEmail}`,
        token: JSON.stringify({ hash: hashedCode, attempts: 0, lastSentAt: Date.now() }),
        expires: new Date(Date.now() + 10 * 60 * 1000),
      },
    })

    // Dispatch real verification email via SMTP
    const mailResult = await sendVerificationEmail(normalizedEmail, code, locale)
    if (!mailResult.success) {
      console.error('[AUTH REGISTER] Failed to send verification email to', normalizedEmail, mailResult.error)

      // Rollback unverified user and token so no orphaned state remains
      await db.verificationToken.deleteMany({
        where: { identifier: `verify:${normalizedEmail}` },
      }).catch(() => {})
      await db.user.delete({
        where: { id: user.id },
      }).catch(() => {})

      return NextResponse.json(
        {
          error:
            mailResult.error ||
            'Failed to dispatch verification email. Please check your email address and try again.',
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        requireVerification: true,
        email: user.email,
        username: user.username,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}
