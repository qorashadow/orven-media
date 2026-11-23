import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { slugify } from '@/lib/utils'

export async function GET() {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const news = await db.news.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ news })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { title, content, image, published } = await req.json()
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    const baseSlug = slugify(title)
    const existing = await db.news.findUnique({ where: { slug: baseSlug } })
    const slug = existing ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug

    const item = await db.news.create({
      data: {
        title,
        slug,
        content,
        image: image || null,
        published: published ?? true,
      },
    })

    return NextResponse.json({ success: true, item }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create news' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id, published, title, content } = await req.json()
    if (!id) {
      return NextResponse.json({ error: 'Missing news id' }, { status: 400 })
    }

    const updated = await db.news.update({
      where: { id },
      data: {
        ...(published !== undefined ? { published } : {}),
        ...(title ? { title } : {}),
        ...(content ? { content } : {}),
      },
    })

    return NextResponse.json({ success: true, item: updated })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update news' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Missing news id' }, { status: 400 })
    }

    await db.news.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete news' }, { status: 500 })
  }
}
