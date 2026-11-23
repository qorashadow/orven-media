import { NextResponse } from 'next/server'
import bcryptjs from 'bcryptjs'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { sendEmailChangeCode, type EmailLocale } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { newEmail, locale = 'en' } = await req.json()
    if (!newEmail || !newEmail.includes('@')) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }

    const normalizedEmail = newEmail.toLowerCase().trim()

    // Check if new email is already taken
    const existing = await db.user.findUnique({
      where: { email: normalizedEmail },
    })
    if (existing) {
      return NextResponse.json({ error: 'This email is already in use by another account' }, { status: 409 })
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const hashedCode = await bcryptjs.hash(code, 10)

    const identifier = `change-email:${session.user.id}:${normalizedEmail}`
    await db.verificationToken.deleteMany({ where: { identifier } }).catch(() => {})

    await db.verificationToken.create({
      data: {
        identifier,
        token: JSON.stringify({ hash: hashedCode, attempts: 0, lastSentAt: Date.now() }),
        expires: new Date(Date.now() + 10 * 60 * 1000),
      },
    })

    const emailLoc: EmailLocale = ['en', 'uz', 'ru'].includes(locale) ? locale : 'en'
    await sendEmailChangeCode(normalizedEmail, code, emailLoc)

    return NextResponse.json({
      success: true,
      message: 'Confirmation code dispatched to your new email inbox.',
    })
  } catch (err) {
    console.error('Request email change error:', err)
    return NextResponse.json({ error: 'Failed to request email change' }, { status: 500 })
  }
}
