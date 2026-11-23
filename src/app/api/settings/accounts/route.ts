import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const accounts = await db.account.findMany({
      where: { userId: session.user.id },
      select: { id: true, provider: true },
    })

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    })

    const hasPassword = !!user?.password

    return NextResponse.json({
      accounts: accounts.map((a) => a.provider),
      hasPassword,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const provider = searchParams.get('provider')
    if (!provider) return NextResponse.json({ error: 'Provider required' }, { status: 400 })

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { accounts: true },
    })

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Must have at least one authentication method remaining (password or another OAuth account)
    const hasPassword = !!user.password
    const remainingOAuth = user.accounts.filter((a) => a.provider !== provider).length

    if (!hasPassword && remainingOAuth === 0) {
      return NextResponse.json(
        { error: 'Cannot unlink the only sign-in method. Please set a password first.' },
        { status: 400 }
      )
    }

    await db.account.deleteMany({
      where: {
        userId: session.user.id,
        provider,
      },
    })

    return NextResponse.json({ success: true, message: `Unlinked ${provider} successfully` })
  } catch {
    return NextResponse.json({ error: 'Failed to unlink account' }, { status: 500 })
  }
}
