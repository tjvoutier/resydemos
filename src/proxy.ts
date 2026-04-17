import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { SESSION_COOKIE_NAME } from '@/lib/checkin/auth'

// Duplicated here because proxy should be self-contained and avoid
// shared module state. The Node.js runtime is available in proxy (v15.5+).
function expectedToken(): string {
  const password = process.env.CHECKIN_PASSWORD ?? ''
  return createHash('sha256').update(password).digest('hex')
}

export function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
  if (token === expectedToken()) return NextResponse.next()
  return NextResponse.redirect(new URL('/login', request.url))
}

export const config = {
  matcher: ['/checkin', '/checkin/:path*', '/history', '/history/:path*'],
}
