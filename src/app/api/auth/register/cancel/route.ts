import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const normalizedEmail = (email as string).toLowerCase().trim()

    // Find user
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    })

    // Only clean up unverified USER accounts
    if (user && user.emailVerified === null && user.role === 'USER') {
      await db.verificationToken.deleteMany({
        where: { identifier: `verify:${normalizedEmail}` },
      }).catch(() => {})

      await db.session.deleteMany({ where: { userId: user.id } }).catch(() => {})
      await db.account.deleteMany({ where: { userId: user.id } }).catch(() => {})
      await db.user.delete({ where: { id: user.id } }).catch(() => {})
    }

    return NextResponse.json({
      success: true,
      message: 'Unverified registration cancelled and username released',
    })
  } catch (error) {
    console.error('Cancel registration error:', error)
    return NextResponse.json({ error: 'Failed to cancel registration' }, { status: 500 })
  }
}
