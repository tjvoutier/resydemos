import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE, expectedToken } from '@/lib/checkin/auth'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { password } = body

  if (!password || typeof password !== 'string') {
    return NextResponse.json({ error: 'Missing password' }, { status: 400 })
  }

  const submitted = createHash('sha256').update(password).digest('hex')
  const expected = expectedToken()

  if (submitted !== expected) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, expected, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })

  return NextResponse.json({ ok: true })
}
