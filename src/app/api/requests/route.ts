import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { requestSchema } from '@/lib/validations'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ requests: [] })

    const requests = await db.animeRequest.findMany({
      where: session.user.role === 'ADMIN' ? {} : { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { username: true } } },
    })

    return NextResponse.json({ requests })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validation = requestSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0]?.message }, { status: 400 })
    }

    const { title, details } = validation.data

    const animeRequest = await db.animeRequest.create({
      data: {
        userId: session.user.id,
        title,
        details,
      },
    })

    return NextResponse.json({ success: true, animeRequest }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 })
  }
}
