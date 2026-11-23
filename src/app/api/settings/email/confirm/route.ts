import { NextResponse } from 'next/server'
import bcryptjs from 'bcryptjs'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { newEmail, code } = await req.json()
    if (!newEmail || !code) {
      return NextResponse.json({ error: 'New email and 6-digit confirmation code are required' }, { status: 400 })
    }

    const normalizedEmail = newEmail.toLowerCase().trim()
    const identifier = `change-email:${session.user.id}:${normalizedEmail}`

    const record = await db.verificationToken.findFirst({
      where: { identifier },
    })

    if (!record || new Date() > record.expires) {
      return NextResponse.json({ error: 'Invalid or expired confirmation code' }, { status: 400 })
    }

    let payload: { hash: string; attempts: number }
    try {
      payload = JSON.parse(record.token)
    } catch {
      payload = { hash: record.token, attempts: 0 }
    }

    if (payload.attempts >= 5) {
      return NextResponse.json({ error: 'Too many incorrect attempts. Code blocked for security.' }, { status: 429 })
    }

    const isValid = await bcryptjs.compare(code.trim(), payload.hash)
    if (!isValid) {
      payload.attempts += 1
      await db.verificationToken.update({
        where: { token: record.token },
        data: { token: JSON.stringify(payload) },
      })
      return NextResponse.json({ error: 'Invalid confirmation code' }, { status: 400 })
    }

    // Update user's email
    await db.user.update({
      where: { id: session.user.id },
      data: {
        email: normalizedEmail,
        emailVerified: new Date(),
      },
    })

    // Delete token
    await db.verificationToken.delete({ where: { token: record.token } }).catch(() => {})

    return NextResponse.json({
      success: true,
      message: 'Email address updated successfully!',
    })
  } catch (err) {
    console.error('Confirm email change error:', err)
    return NextResponse.json({ error: 'Failed to update email address' }, { status: 500 })
  }
}
