import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { commentSchema } from '@/lib/validations'

export async function GET(req: Request) {
  try {
    const session = await auth()
    const currentUserId = session?.user?.id

    const { searchParams } = new URL(req.url)
    const animeId = searchParams.get('animeId')
    const episodeId = searchParams.get('episodeId')
    const sort = searchParams.get('sort') || 'newest'

    const where: any = {
      parentId: null, // top-level comments
    }

    if (episodeId) {
      where.episodeId = episodeId
    } else if (animeId) {
      where.animeId = animeId
      where.episodeId = null
    }

    const orderBy: any = {}
    if (sort === 'oldest') orderBy.createdAt = 'asc'
    else orderBy.createdAt = 'desc' // top/newest handled

    const rawComments = await db.comment.findMany({
      where,
      orderBy,
      include: {
        user: { select: { id: true, username: true, avatar: true } },
        likes: true,
        replies: {
          include: {
            user: { select: { id: true, username: true, avatar: true } },
            likes: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    // Format likes count and user interaction
    const formatComment = (c: any) => {
      const likesCount = c.likes.filter((l: any) => l.isLike).length
      const dislikesCount = c.likes.filter((l: any) => !l.isLike).length
      const userLike = currentUserId ? c.likes.find((l: any) => l.userId === currentUserId) : null

      return {
        id: c.id,
        content: c.content,
        isSpoiler: c.isSpoiler,
        isEdited: c.isEdited,
        createdAt: c.createdAt,
        user: c.user,
        likesCount,
        dislikesCount,
        userLike,
        replies: c.replies ? c.replies.map(formatComment) : [],
      }
    }

    let comments = rawComments.map(formatComment)

    if (sort === 'top') {
      comments.sort((a, b) => b.likesCount - a.likesCount)
    }

    return NextResponse.json({ comments, total: comments.length })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validation = commentSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0]?.message }, { status: 400 })
    }

    const { animeId, episodeId, parentId, content, isSpoiler } = validation.data

    const comment = await db.comment.create({
      data: {
        userId: session.user.id,
        animeId: animeId || null,
        episodeId: episodeId || null,
        parentId: parentId || null,
        content,
        isSpoiler,
      },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
      },
    })

    // If this is a reply, create notification for parent comment author
    if (parentId) {
      const parent = await db.comment.findUnique({
        where: { id: parentId },
        select: { userId: true, animeId: true },
      })
      if (parent && parent.userId !== session.user.id) {
        await db.notification.create({
          data: {
            userId: parent.userId,
            type: 'COMMENT_REPLY',
            title: 'New Reply',
            message: `${session.user.name || session.user.username} replied to your comment.`,
            link: parent.animeId ? `/anime/${parent.animeId}` : undefined,
            animeId: parent.animeId,
          },
        }).catch(() => {})
      }
    }

    return NextResponse.json({ success: true, comment }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}
