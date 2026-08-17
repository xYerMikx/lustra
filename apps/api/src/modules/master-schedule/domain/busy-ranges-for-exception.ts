import {
  MASTER_TIMEZONE,
  addDaysToYmdDate,
  zonedLocalToUtc,
} from '@/modules/scheduling/domain/tz'

export type BusyRange = {
  startsAt: Date
  endsAt: Date
}

/**
 * UTC ranges that would stop being working time after applying the exception.
 * Held/booked granules in these ranges must block the write.
 */
export function busyRangesForException(input: {
  ymdDate: string
  type: 'day_off' | 'custom_hours'
  startMin?: number | null
  endMin?: number | null
  timeZone?: string
}): BusyRange[] {
  const timeZone = input.timeZone ?? MASTER_TIMEZONE
  const dayStart = zonedLocalToUtc(input.ymdDate, 0, timeZone)
  const dayEnd = zonedLocalToUtc(addDaysToYmdDate(input.ymdDate, 1), 0, timeZone)

  if (input.type === 'day_off') {
    return [{ startsAt: dayStart, endsAt: dayEnd }]
  }

  const startMin = input.startMin ?? 0
  const endMin = input.endMin ?? 0
  const customStart = zonedLocalToUtc(input.ymdDate, startMin, timeZone)
  const customEnd = zonedLocalToUtc(input.ymdDate, endMin, timeZone)
  const ranges: BusyRange[] = []

  if (customStart > dayStart) {
    ranges.push({ startsAt: dayStart, endsAt: customStart })
  }

  if (customEnd < dayEnd) {
    ranges.push({ startsAt: customEnd, endsAt: dayEnd })
  }

  return ranges
}
