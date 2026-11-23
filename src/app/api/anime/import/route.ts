import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { searchAniList } from '@/lib/api'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { query } = await req.json()
    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 })
    }

    const results = await searchAniList(query)
    return NextResponse.json({ results })
  } catch (error) {
    return NextResponse.json({ error: 'AniList API search failed' }, { status: 500 })
  }
}
