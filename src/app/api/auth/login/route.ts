import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE, expectedToken } from '@/lib/checkin/auth'

export async function POST(request: NextRequest) {
  const { password } = await request.json()
  const cookieStore = await cookies()

  if (!password || typeof password !== 'string') {
    return NextResponse.json({ error: 'Missing password' }, { status: 400 })
  }

  const submitted = createHash('sha256').update(password).digest('hex')

  if (submitted !== expectedToken()) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  cookieStore.set(SESSION_COOKIE_NAME, expectedToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })

  return NextResponse.json({ ok: true })
}
