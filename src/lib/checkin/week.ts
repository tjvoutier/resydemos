import { startOfWeek, addDays, endOfDay } from 'date-fns'
import { toZonedTime, fromZonedTime } from 'date-fns-tz'

const ET = 'America/New_York'

/**
 * Returns the Monday of the week containing `date`, anchored in ET timezone.
 * The returned Date is a UTC midnight value for that Monday.
 */
export function getWeekStart(date: Date): Date {
  // Convert to ET to determine which calendar day/week we're in
  const zonedDate = toZonedTime(date, ET)
  // startOfWeek with Monday as week start
  const mondayZoned = startOfWeek(zonedDate, { weekStartsOn: 1 })
  // Convert that ET midnight back to UTC
  return fromZonedTime(mondayZoned, ET)
}

/**
 * Returns a string like "Apr 13–17, 2026" for the Mon–Fri of the given week.
 * `weekStart` is the Monday of the week (UTC midnight).
 */
export function formatWeekRange(weekStart: Date): string {
  const friday = addDays(weekStart, 4)

  const monthFmt = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    timeZone: 'UTC',
  })
  const dayFmt = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    timeZone: 'UTC',
  })
  const yearFmt = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    timeZone: 'UTC',
  })

  const month = monthFmt.format(weekStart)
  const startDay = dayFmt.format(weekStart)
  const endDay = dayFmt.format(friday)
  const year = yearFmt.format(weekStart)

  return `${month} ${startDay}–${endDay}, ${year}`
}

/**
 * Returns a string like "04/20 – 04/24" for the Mon–Fri of the NEXT week.
 */
export function formatNextWeekRange(weekStart: Date): string {
  const nextMonday = addDays(weekStart, 7)
  const nextFriday = addDays(weekStart, 11)

  const pad = (n: number) => String(n).padStart(2, '0')

  // Use UTC values since these dates are UTC midnight
  const monMonth = pad(nextMonday.getUTCMonth() + 1)
  const monDay = pad(nextMonday.getUTCDate())
  const friMonth = pad(nextFriday.getUTCMonth() + 1)
  const friDay = pad(nextFriday.getUTCDate())

  return `${monMonth}/${monDay} – ${friMonth}/${friDay}`
}

/**
 * Returns true if `now` is before the end of the following Monday (in ET).
 * The cutoff is 23:59:59 ET on the Monday one week after `weekStart`.
 */
export function isEditable(weekStart: Date, now: Date = new Date()): boolean {
  // weekStart is stored as UTC midnight for a given calendar date (e.g. 2026-04-13T00:00:00Z)
  // We need the following Monday as a calendar date in ET, not just +7 days from UTC midnight.
  // Extract the UTC date components which represent the intended calendar date.
  const year = weekStart.getUTCFullYear()
  const month = weekStart.getUTCMonth()
  const day = weekStart.getUTCDate()

  // Build a zoned date at the start of that Monday in ET, then add 7 days
  const weekStartET = fromZonedTime(new Date(year, month, day, 0, 0, 0), ET)
  const followingMondayET = addDays(weekStartET, 7)

  // Get end of that day in ET
  const followingMondayZoned = toZonedTime(followingMondayET, ET)
  const cutoffZoned = endOfDay(followingMondayZoned)
  const cutoff = fromZonedTime(cutoffZoned, ET)
  return now < cutoff
}

/**
 * Returns a YYYY-MM-DD string for the given date (using UTC date parts).
 */
export function toDateString(d: Date): string {
  const year = d.getUTCFullYear()
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
