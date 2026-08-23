import { MASTER_TIMEZONE, formatYmdDateInTimeZone } from '@/modules/scheduling/domain/tz'
import { deferQuietHours } from '@/modules/notifications/domain/quiet-hours'

const DAY_MS = 24 * 60 * 60 * 1000
const MASTER_LEAD_MS = 2 * 60 * 60 * 1000

export type ReminderAudience = 'client' | 'master'

function clampToNowIfPast(fireAt: Date, now: Date): Date {
  if (fireAt.getTime() < now.getTime()) {
    return now
  }

  return fireAt
}

function skipIfNotBeforeVisit(fireAt: Date, startsAt: Date): Date | null {
  if (fireAt.getTime() >= startsAt.getTime()) {
    return null
  }

  return fireAt
}

export function clientReminderFireAt(input: {
  startsAt: Date
  bookedAt: Date
  now: Date
  applyQuietHours: boolean
  timeZone?: string
}): Date | null {
  const timeZone = input.timeZone ?? MASTER_TIMEZONE
  const sameDay =
    formatYmdDateInTimeZone(input.startsAt, timeZone) ===
    formatYmdDateInTimeZone(input.bookedAt, timeZone)

  const raw = sameDay
    ? input.bookedAt
    : new Date(input.startsAt.getTime() - DAY_MS)

  const afterNow = clampToNowIfPast(raw, input.now)
  const withQuiet = input.applyQuietHours
    ? deferQuietHours(afterNow, timeZone)
    : afterNow

  return skipIfNotBeforeVisit(withQuiet, input.startsAt)
}

export function masterReminderFireAt(input: {
  startsAt: Date
  now: Date
  applyQuietHours: boolean
  timeZone?: string
}): Date | null {
  const timeZone = input.timeZone ?? MASTER_TIMEZONE
  const raw = new Date(input.startsAt.getTime() - MASTER_LEAD_MS)

  if (raw.getTime() < input.now.getTime()) {
    return null
  }

  const withQuiet = input.applyQuietHours
    ? deferQuietHours(raw, timeZone)
    : raw

  return skipIfNotBeforeVisit(withQuiet, input.startsAt)
}

export function reminderFireAt(
  audience: ReminderAudience,
  input: {
    startsAt: Date
    bookedAt: Date
    now: Date
    applyQuietHours: boolean
    timeZone?: string
  },
): Date | null {
  if (audience === 'client') {
    return clientReminderFireAt(input)
  }

  return masterReminderFireAt(input)
}
