import { NextResponse } from 'next/server'
import bcryptjs from 'bcryptjs'
import { db } from '@/lib/db'
import { sendVerificationEmail, type EmailLocale } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const { email, locale = 'en' } = await req.json()
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const normalizedEmail = (email as string).toLowerCase().trim()

    // 1. Check if user exists
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    })
    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email. Please register first.' },
        { status: 404 }
      )
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'This email is already verified. Please sign in.' },
        { status: 400 }
      )
    }

    const identifier = `verify:${normalizedEmail}`
    const existing = await db.verificationToken.findFirst({
      where: { identifier },
    })

    if (existing) {
      try {
        const payload = JSON.parse(existing.token)
        const elapsed = Date.now() - (payload.lastSentAt || 0)
        if (elapsed < 60000) {
          const waitSecs = Math.ceil((60000 - elapsed) / 1000)
          return NextResponse.json(
            { error: `Please wait ${waitSecs} seconds before requesting a new code.` },
            { status: 429 }
          )
        }
      } catch {}

      await db.verificationToken.delete({ where: { token: existing.token } }).catch(() => {})
    }

    // Generate new code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const hashedCode = await bcryptjs.hash(code, 10)

    await db.verificationToken.create({
      data: {
        identifier,
        token: JSON.stringify({ hash: hashedCode, attempts: 0, lastSentAt: Date.now() }),
        expires: new Date(Date.now() + 10 * 60 * 1000),
      },
    })

    const emailLoc: EmailLocale = ['en', 'uz', 'ru'].includes(locale) ? locale : 'en'
    const mailResult = await sendVerificationEmail(normalizedEmail, code, emailLoc)
    if (!mailResult.success) {
      console.error('[AUTH RESEND] Failed to send verification email to', normalizedEmail, mailResult.error)
      return NextResponse.json(
        { error: mailResult.error || 'Failed to dispatch verification email. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Verification code resent successfully' })
  } catch (err) {
    console.error('Resend error:', err)
    return NextResponse.json({ error: 'Failed to resend code' }, { status: 500 })
  }
}
