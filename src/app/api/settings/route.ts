import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { settingsSchema } from '@/lib/validations'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        bio: true,
        avatar: true,
        banner: true,
        isPublic: true,
        hideHistory: true,
        nsfwFilter: true,
        language: true,
        cardSize: true,
        autoplay: true,
        autoNext: true,
        skipIntro: true,
        defaultSubLang: true,
        defaultQuality: true,
      },
    })

    return NextResponse.json({ settings: user })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const validation = settingsSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0]?.message }, { status: 400 })
    }

    const updated = await db.user.update({
      where: { id: session.user.id },
      data: validation.data,
    })

    return NextResponse.json({ success: true, settings: updated })
  } catch {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
