import {
  MASTER_TIMEZONE,
  addDaysToYmdDate,
  zonedLocalToUtc,
} from '@/shared/lib/tz'

/** Build UTC ISO range for a local calendar day or intra-day interval (master TZ). */
export function buildBlockIsoRange(input: {
  date: string
  allDay: boolean
  startTime: string
  endTime: string
  timeZone?: string
}): { startsAt: string; endsAt: string } {
  const timeZone = input.timeZone ?? MASTER_TIMEZONE

  if (input.allDay) {
    return {
      startsAt: zonedLocalToUtc(input.date, 0, timeZone).toISOString(),
      endsAt: zonedLocalToUtc(
        addDaysToYmdDate(input.date, 1),
        0,
        timeZone,
      ).toISOString(),
    }
  }

  const [startH, startM] = input.startTime.split(':').map(Number)
  const [endH, endM] = input.endTime.split(':').map(Number)

  return {
    startsAt: zonedLocalToUtc(
      input.date,
      (startH ?? 0) * 60 + (startM ?? 0),
      timeZone,
    ).toISOString(),
    endsAt: zonedLocalToUtc(
      input.date,
      (endH ?? 0) * 60 + (endM ?? 0),
      timeZone,
    ).toISOString(),
  }
}
