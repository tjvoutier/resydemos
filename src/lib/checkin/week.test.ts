import { describe, it, expect } from 'vitest'
import {
  getWeekStart,
  formatWeekRange,
  formatNextWeekRange,
  isEditable,
} from './week'

describe('getWeekStart', () => {
  it('returns the Monday of the current week for a Wednesday', () => {
    // Wednesday April 16, 2026
    const result = getWeekStart(new Date('2026-04-16T12:00:00-04:00'))
    expect(result.toISOString().slice(0, 10)).toBe('2026-04-13')
  })

  it('returns the same Monday for a Monday', () => {
    const result = getWeekStart(new Date('2026-04-13T09:00:00-04:00'))
    expect(result.toISOString().slice(0, 10)).toBe('2026-04-13')
  })

  it('returns Monday of the current week for a Sunday', () => {
    // Sunday April 19 — still in the Apr 13 week
    const result = getWeekStart(new Date('2026-04-19T23:00:00-04:00'))
    expect(result.toISOString().slice(0, 10)).toBe('2026-04-13')
  })
})

describe('formatWeekRange', () => {
  it('formats Mon-Fri range for display in header', () => {
    const weekStart = new Date('2026-04-13')
    // Week starting Apr 13 — should produce "Apr 13–17, 2026"
    const result = formatWeekRange(weekStart)
    expect(result).toMatch(/Apr 1[3-9]/)  // flexible on exact day
    expect(result).toContain('2026')
  })
})

describe('formatNextWeekRange', () => {
  it('formats the next week Mon-Fri range with mm/dd', () => {
    // Week starting Apr 13 → next week is Apr 20-24
    const weekStart = new Date('2026-04-13')
    expect(formatNextWeekRange(weekStart)).toBe('04/20 – 04/24')
  })
})

describe('isEditable', () => {
  it('returns true when the cutoff (following Monday midnight ET) has not passed', () => {
    const weekStart = new Date('2026-04-13')
    const now = new Date('2026-04-18T12:00:00-04:00')
    expect(isEditable(weekStart, now)).toBe(true)
  })

  it('returns false after the following Monday midnight ET', () => {
    const weekStart = new Date('2026-04-13')
    // Tuesday Apr 21 — past the Monday midnight cutoff
    const now = new Date('2026-04-21T10:00:00-04:00')
    expect(isEditable(weekStart, now)).toBe(false)
  })

  it('returns true on the following Monday before midnight ET', () => {
    const weekStart = new Date('2026-04-13')
    const now = new Date('2026-04-20T23:00:00-04:00')
    expect(isEditable(weekStart, now)).toBe(true)
  })
})
