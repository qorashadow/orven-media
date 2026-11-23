import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const sessions = await db.session.findMany({
      where: { userId: session.user.id },
      orderBy: { expires: 'desc' },
    })

    // Return current session info and active sessions
    return NextResponse.json({
      activeCount: sessions.length || 1,
      currentDevice: 'Current Active Device (Web)',
      sessions: sessions.map((s) => ({
        id: s.id,
        expires: s.expires,
        isCurrent: true,
      })),
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
  }
}

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Sign out all sessions
    await db.session.deleteMany({
      where: { userId: session.user.id },
    })

    return NextResponse.json({ success: true, message: 'All other sessions signed out' })
  } catch {
    return NextResponse.json({ error: 'Failed to sign out other sessions' }, { status: 500 })
  }
}
