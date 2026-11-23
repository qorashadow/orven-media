import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getStorage } from '@/lib/storage'
import { FILE_LIMITS } from '@/lib/constants'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const directory = (formData.get('directory') as string) || 'general'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Size limit
    if (file.size > FILE_LIMITS.VIDEO_MAX_SIZE) {
      return NextResponse.json({ error: 'File size too large' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const storage = getStorage()
    const filepath = await storage.upload(buffer, file.name, directory)
    const url = storage.getUrl(filepath)

    return NextResponse.json({
      success: true,
      filepath,
      url,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
