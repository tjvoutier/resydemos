import { createHash } from 'crypto'

export const SESSION_COOKIE_NAME = 'checkin_session'
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30 // 30 days in seconds

export function expectedToken(): string {
  const password = process.env.CHECKIN_PASSWORD
  if (!password) throw new Error('CHECKIN_PASSWORD env var is not set')
  return createHash('sha256').update(password).digest('hex')
}
