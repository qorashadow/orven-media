import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { profileSchema } from '@/lib/validations'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const username = searchParams.get('username')

    if (!username) {
      const session = await auth()
      if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      const me = await db.user.findUnique({
        where: { id: session.user.id },
      })
      return NextResponse.json({ user: me })
    }

    const user = await db.user.findUnique({
      where: { username },
      include: {
        _count: {
          select: {
            watchHistory: true,
            watchlist: true,
            favorites: true,
            comments: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validation = profileSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    const updated = await db.user.update({
      where: { id: session.user.id },
      data: validation.data,
    })

    return NextResponse.json({ success: true, user: updated })
  } catch {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
