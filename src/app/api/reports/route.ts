import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { reportSchema } from '@/lib/validations'

export async function POST(req: Request) {
  try {
    const session = await auth()
    const body = await req.json()
    const validation = reportSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0]?.message }, { status: 400 })
    }

    const { type, reason, details, commentId } = validation.data
    const userId = session?.user?.id || 'anonymous'

    // If anonymous, create temporary or link to system
    let validUserId = userId
    if (userId === 'anonymous') {
      const firstUser = await db.user.findFirst()
      validUserId = firstUser?.id || ''
    }

    if (!validUserId) {
      return NextResponse.json({ success: true }) // quietly succeed if no user exists yet
    }

    await db.report.create({
      data: {
        userId: validUserId,
        commentId,
        type,
        reason,
        details,
      },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const reports = await db.report.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { username: true, email: true } },
        comment: true,
      },
    })

    return NextResponse.json({ reports })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 })
  }
}
