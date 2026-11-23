import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { episodeSchema } from '@/lib/validations'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const episodes = await db.episode.findMany({
      where: { animeId: id },
      orderBy: { number: 'asc' },
      include: {
        subtitles: true,
        servers: true,
      },
    })

    return NextResponse.json({ episodes })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch episodes' }, { status: 500 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const validation = episodeSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0]?.message }, { status: 400 })
    }

    const data = validation.data

    const episode = await db.episode.upsert({
      where: {
        animeId_number: {
          animeId: id,
          number: data.number,
        },
      },
      update: {
        title: data.title,
        thumbnail: data.thumbnail,
        duration: data.duration,
        videoUrl: data.videoUrl,
        videoType: data.videoType,
        introStart: data.introStart,
        introEnd: data.introEnd,
        outroStart: data.outroStart,
        filler: data.filler,
        recap: data.recap,
        aired: data.aired ? new Date(data.aired) : undefined,
      },
      create: {
        animeId: id,
        number: data.number,
        title: data.title,
        thumbnail: data.thumbnail,
        duration: data.duration,
        videoUrl: data.videoUrl,
        videoType: data.videoType,
        introStart: data.introStart,
        introEnd: data.introEnd,
        outroStart: data.outroStart,
        filler: data.filler,
        recap: data.recap,
        aired: data.aired ? new Date(data.aired) : undefined,
      },
    })

    return NextResponse.json({ success: true, episode }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save episode' }, { status: 500 })
  }
}
