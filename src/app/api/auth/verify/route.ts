import { NextResponse } from 'next/server'
import bcryptjs from 'bcryptjs'
import { db } from '@/lib/db'
import { sendWelcomeEmail, type EmailLocale } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const { email, code, locale = 'en' } = await req.json()
    if (!email || !code) {
      return NextResponse.json({ error: 'Email and 6-digit code are required' }, { status: 400 })
    }

    const normalizedEmail = (email as string).toLowerCase().trim()
    const identifier = `verify:${normalizedEmail}`

    // Find target user
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'No pending registration found for this email. Please register again.' },
        { status: 404 }
      )
    }

    if (user.emailVerified) {
      return NextResponse.json({ success: true, message: 'Account is already verified. Please sign in.' })
    }

    const record = await db.verificationToken.findFirst({
      where: { identifier },
    })

    if (!record) {
      return NextResponse.json({ error: 'No pending verification found or code has expired' }, { status: 400 })
    }

    if (new Date() > record.expires) {
      await db.verificationToken.delete({ where: { token: record.token } }).catch(() => {})
      return NextResponse.json({ error: 'Verification code has expired. Please request a new code.' }, { status: 400 })
    }

    let payload: { hash: string; attempts: number; lastSentAt: number }
    try {
      payload = JSON.parse(record.token)
    } catch {
      payload = { hash: record.token, attempts: 0, lastSentAt: 0 }
    }

    if (payload.attempts >= 5) {
      return NextResponse.json(
        { error: 'Too many incorrect attempts. This code is blocked for security. Please request a new code.' },
        { status: 429 }
      )
    }

    const isValid = await bcryptjs.compare(code.trim(), payload.hash)
    if (!isValid) {
      payload.attempts += 1
      await db.verificationToken.update({
        where: { token: record.token },
        data: { token: JSON.stringify(payload) },
      })

      const remaining = 5 - payload.attempts
      return NextResponse.json(
        { error: `Invalid code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.` },
        { status: 400 }
      )
    }

    // Code verified! Mark email as verified
    const updatedUser = await db.user.update({
      where: { email: normalizedEmail },
      data: { emailVerified: new Date() },
    })

    // Clean up verification token
    await db.verificationToken.delete({ where: { token: record.token } }).catch(() => {})

    // Send welcome email in user's language
    const emailLoc: EmailLocale = ['en', 'uz', 'ru'].includes(locale) ? locale : 'en'
    sendWelcomeEmail(normalizedEmail, updatedUser.username, emailLoc).catch(() => {})

    return NextResponse.json({ success: true, message: 'Account verified successfully!' })
  } catch (err: any) {
    console.error('Verify error:', err)
    return NextResponse.json({ error: 'Failed to verify account' }, { status: 500 })
  }
}
