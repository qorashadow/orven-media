import { NextResponse } from 'next/server'
import bcryptjs from 'bcryptjs'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { changePasswordSchema } from '@/lib/validations'

export async function PUT(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const validation = changePasswordSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0]?.message }, { status: 400 })
    }

    const { currentPassword, newPassword } = validation.data
    const user = await db.user.findUnique({ where: { id: session.user.id } })

    if (!user || !user.password) {
      return NextResponse.json({ error: 'Account has no password set' }, { status: 400 })
    }

    const isValid = await bcryptjs.compare(currentPassword, user.password)
    if (!isValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10)
    await db.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
  }
}
