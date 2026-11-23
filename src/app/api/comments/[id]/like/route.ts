import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: commentId } = await params
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { isLike } = await req.json()

    const existing = await db.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId: session.user.id,
          commentId,
        },
      },
    })

    if (existing) {
      if (existing.isLike === isLike) {
        // Toggle off
        await db.commentLike.delete({ where: { id: existing.id } })
        return NextResponse.json({ success: true, action: 'removed' })
      } else {
        // Switch like/dislike
        await db.commentLike.update({
          where: { id: existing.id },
          data: { isLike },
        })
        return NextResponse.json({ success: true, action: 'updated' })
      }
    } else {
      await db.commentLike.create({
        data: {
          userId: session.user.id,
          commentId,
          isLike,
        },
      })
      return NextResponse.json({ success: true, action: 'added' })
    }
  } catch {
    return NextResponse.json({ error: 'Failed to update reaction' }, { status: 500 })
  }
}
