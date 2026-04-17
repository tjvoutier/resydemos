import { describe, it, expect } from 'vitest'
import { CheckIn } from './db'

describe('CheckIn type', () => {
  it('has the expected shape', () => {
    const c: CheckIn = {
      id: 'abc',
      week_start: '2026-04-13',
      highlights: null,
      challenges: null,
      priorities: null,
      talking_points: null,
      shoutouts: null,
      status: 'draft',
      submitted_at: null,
      updated_at: new Date().toISOString(),
    }
    expect(c.status).toBe('draft')
    expect(c.week_start).toBe('2026-04-13')
  })
})
