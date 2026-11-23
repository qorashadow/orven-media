import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { ratingSchema } from '@/lib/validations'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validation = ratingSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid score' }, { status: 400 })
    }

    const { animeId, score } = validation.data

    await db.rating.upsert({
      where: {
        userId_animeId: {
          userId: session.user.id,
          animeId,
        },
      },
      update: { score, updatedAt: new Date() },
      create: { userId: session.user.id, animeId, score },
    })

    // Recalculate averageScore for anime
    const ratings = await db.rating.findMany({ where: { animeId } })
    const avg = ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
    // Convert 1-10 to 10-100 scale
    const finalScore = Math.round(avg * 10)

    await db.anime.update({
      where: { id: animeId },
      data: { averageScore: finalScore },
    })

    return NextResponse.json({ success: true, averageScore: finalScore })
  } catch {
    return NextResponse.json({ error: 'Failed to save rating' }, { status: 500 })
  }
}
