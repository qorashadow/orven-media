import { NextResponse } from 'next/server'
import bcryptjs from 'bcryptjs'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { email, code, token, password } = await req.json()

    if (!password || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 })
    }

    let targetEmail: string | null = null

    // Case 1: 6-digit code verification
    if (email && code) {
      const normalizedEmail = (email as string).toLowerCase().trim()
      const record = await db.verificationToken.findFirst({
        where: { identifier: `reset:${normalizedEmail}` },
      })

      if (!record || new Date() > record.expires) {
        return NextResponse.json({ error: 'Invalid or expired reset code' }, { status: 400 })
      }

      let payload: { hash: string; attempts: number }
      try {
        payload = JSON.parse(record.token)
      } catch {
        payload = { hash: record.token, attempts: 0 }
      }

      if (payload.attempts >= 5) {
        return NextResponse.json({ error: 'Too many incorrect attempts. Code locked for security.' }, { status: 429 })
      }

      const isValid = await bcryptjs.compare(code.trim(), payload.hash)
      if (!isValid) {
        payload.attempts += 1
        await db.verificationToken.update({
          where: { token: record.token },
          data: { token: JSON.stringify(payload) },
        })
        return NextResponse.json({ error: 'Invalid reset code' }, { status: 400 })
      }

      targetEmail = normalizedEmail
      await db.verificationToken.delete({ where: { token: record.token } }).catch(() => {})
    }
    // Case 2: One-time token link
    else if (token) {
      const resetRequest = await db.passwordReset.findUnique({
        where: { token },
      })

      if (!resetRequest || resetRequest.expires < new Date()) {
        return NextResponse.json({ error: 'Invalid or expired reset link' }, { status: 400 })
      }

      targetEmail = resetRequest.email
      await db.passwordReset.delete({ where: { id: resetRequest.id } }).catch(() => {})
    } else {
      return NextResponse.json({ error: 'Reset code or token is required' }, { status: 400 })
    }

    if (!targetEmail) {
      return NextResponse.json({ error: 'Failed to verify reset request' }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await bcryptjs.hash(password, 10)

    const user = await db.user.update({
      where: { email: targetEmail },
      data: { password: hashedPassword },
    })

    // Invalidate all active sessions for this user so old devices must re-login
    await db.session.deleteMany({
      where: { userId: user.id },
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      message: 'Password has been successfully updated. You can now sign in.',
    })
  } catch (err) {
    console.error('Reset password error:', err)
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
  }
}
