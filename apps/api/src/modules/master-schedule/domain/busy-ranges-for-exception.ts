import {
  MASTER_TIMEZONE,
  addDaysToYmdDate,
  zonedLocalToUtc,
} from '@/modules/scheduling/domain/tz'

export type BusyRange = {
  startsAt: Date
  endsAt: Date
}

export type ExceptionBusyInput = {
  ymdDate: string
  type: 'day_off' | 'custom_hours'
  startMin?: number | null
  endMin?: number | null
  intervals?: Array<{ startMin: number; endMin: number }> | null
  timeZone?: string
}

/**
 * UTC ranges that would stop being working time after applying the exception.
 * Held/booked granules in these ranges must block the write.
 */
export function busyRangesForException(input: ExceptionBusyInput): BusyRange[] {
  const timeZone = input.timeZone ?? MASTER_TIMEZONE
  const dayStart = zonedLocalToUtc(input.ymdDate, 0, timeZone)
  const dayEnd = zonedLocalToUtc(addDaysToYmdDate(input.ymdDate, 1), 0, timeZone)

  if (input.type === 'day_off') {
    return [{ startsAt: dayStart, endsAt: dayEnd }]
  }

  const windows = workingWindows(input)

  if (windows.length === 0) {
    return [{ startsAt: dayStart, endsAt: dayEnd }]
  }

  const ranges: BusyRange[] = []
  let cursor = dayStart

  for (const window of windows) {
    const windowStart = zonedLocalToUtc(input.ymdDate, window.startMin, timeZone)
    const windowEnd = zonedLocalToUtc(input.ymdDate, window.endMin, timeZone)

    if (windowStart > cursor) {
      ranges.push({ startsAt: cursor, endsAt: windowStart })
    }

    cursor = windowEnd
  }

  if (cursor < dayEnd) {
    ranges.push({ startsAt: cursor, endsAt: dayEnd })
  }

  return ranges
}

function workingWindows(input: ExceptionBusyInput): Array<{
  startMin: number
  endMin: number
}> {
  if (input.intervals && input.intervals.length > 0) {
    return [...input.intervals]
      .filter((item) => item.endMin > item.startMin)
      .sort((left, right) => left.startMin - right.startMin)
  }

  if (
    input.startMin == null ||
    input.endMin == null ||
    input.endMin <= input.startMin
  ) {
    return []
  }

  return [{ startMin: input.startMin, endMin: input.endMin }]
}
