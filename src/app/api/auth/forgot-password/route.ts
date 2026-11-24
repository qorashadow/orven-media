import { NextResponse } from 'next/server'
import crypto from 'crypto'
import bcryptjs from 'bcryptjs'
import { db } from '@/lib/db'
import { forgotPasswordSchema } from '@/lib/validations'
import { sendPasswordResetEmail, type EmailLocale } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const locale: EmailLocale = body.locale && ['en', 'uz', 'ru'].includes(body.locale) ? body.locale : 'en'

    const validation = forgotPasswordSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }

    const { email } = validation.data
    const normalizedEmail = email.toLowerCase().trim()
    const user = await db.user.findUnique({ where: { email: normalizedEmail } })

    if (user) {
      // 1. Generate 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      const hashedCode = await bcryptjs.hash(code, 10)

      // Clean old reset tokens
      await db.verificationToken.deleteMany({
        where: { identifier: `reset:${normalizedEmail}` },
      }).catch(() => {})

      await db.verificationToken.create({
        data: {
          identifier: `reset:${normalizedEmail}`,
          token: JSON.stringify({ hash: hashedCode, attempts: 0, lastSentAt: Date.now() }),
          expires: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
        },
      })

      // 2. Also create one-time link token
      const linkToken = crypto.randomBytes(32).toString('hex')
      await db.passwordReset.deleteMany({ where: { email: normalizedEmail } }).catch(() => {})
      await db.passwordReset.create({
        data: {
          email: normalizedEmail,
          token: linkToken,
          expires: new Date(Date.now() + 30 * 60 * 1000),
        },
      })

      // 3. Dispatch reset email with both code and direct one-time token link
      await sendPasswordResetEmail(normalizedEmail, code, locale, linkToken)
    }

    // Always return success to protect user privacy (no email enumeration)
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, a reset code has been sent.',
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
