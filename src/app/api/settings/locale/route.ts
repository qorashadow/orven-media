import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { locale } = await req.json()
    if (!locale || !['en', 'uz', 'ru'].includes(locale)) {
      return NextResponse.json({ error: 'Invalid locale' }, { status: 400 })
    }

    const session = await auth()
    if (session?.user?.id) {
      await db.user.update({
        where: { id: session.user.id },
        data: { language: locale },
      })
    }

    const response = NextResponse.json({ success: true, locale })
    response.cookies.set('locale', locale, {
      path: '/',
      maxAge: 365 * 24 * 60 * 60,
      sameSite: 'lax',
    })

    return response
  } catch {
    return NextResponse.json({ error: 'Failed to update locale' }, { status: 500 })
  }
}
