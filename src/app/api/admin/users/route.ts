import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')

    const where: any = {}
    if (q) {
      where.OR = [
        { username: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ]
    }

    const users = await db.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        banned: true,
        createdAt: true,
        avatar: true,
      },
    })

    return NextResponse.json({ users })
  } catch {
    return NextResponse.json({ error: 'Failed to load users' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { userId, role, banned, banReason } = await req.json()
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

    const user = await db.user.update({
      where: { id: userId },
      data: {
        role: role !== undefined ? role : undefined,
        banned: banned !== undefined ? banned : undefined,
        banReason: banReason !== undefined ? banReason : undefined,
      },
    })

    return NextResponse.json({ success: true, user })
  } catch {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
