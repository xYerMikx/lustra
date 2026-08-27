export const MASTER_TIMEZONE = 'Europe/Minsk'

function pad2(value: number): string {
  return String(value).padStart(2, '0')
}

export function getTimeZoneOffsetMs(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(instant)

  const read = (type: Intl.DateTimeFormatPartTypes): number => {
    const part = parts.find((item) => item.type === type)

    return Number(part?.value ?? NaN)
  }

  const asUtc = Date.UTC(
    read('year'),
    read('month') - 1,
    read('day'),
    read('hour') === 24 ? 0 : read('hour'),
    read('minute'),
    read('second'),
  )

  return asUtc - instant.getTime()
}

export function formatYmdDateInTimeZone(
  instant: Date,
  timeZone: string = MASTER_TIMEZONE,
): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(instant)
}

export function zonedLocalToUtc(
  ymdDate: string,
  minuteOfDay: number,
  timeZone: string = MASTER_TIMEZONE,
): Date {
  const hours = Math.floor(minuteOfDay / 60)
  const minutes = minuteOfDay % 60
  const guess = new Date(`${ymdDate}T${pad2(hours)}:${pad2(minutes)}:00.000Z`)
  const offsetMs = getTimeZoneOffsetMs(guess, timeZone)

  return new Date(guess.getTime() - offsetMs)
}

function ymdParts(ymd: string): { year: number; month: number; day: number } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd)
  const yearToken = match?.[1]
  const monthToken = match?.[2]
  const dayToken = match?.[3]

  if (yearToken === undefined || monthToken === undefined || dayToken === undefined) {
    throw new RangeError(`Invalid YMD date: ${ymd}`)
  }

  return {
    year: Number(yearToken),
    month: Number(monthToken),
    day: Number(dayToken),
  }
}

function formatYmdUtc(utc: Date): string {
  return `${utc.getUTCFullYear()}-${pad2(utc.getUTCMonth() + 1)}-${pad2(utc.getUTCDate())}`
}

export function ymdToUtcDate(ymd: string): Date {
  const { year, month, day } = ymdParts(ymd)

  return new Date(Date.UTC(year, month - 1, day))
}

export function addDaysToYmdDate(ymdDate: string, days: number): string {
  const utc = ymdToUtcDate(ymdDate)
  utc.setUTCDate(utc.getUTCDate() + days)

  return formatYmdUtc(utc)
}

export function endOfYmdMonth(ymd: string): string {
  const utc = ymdToUtcDate(ymd)

  return formatYmdUtc(
    new Date(Date.UTC(utc.getUTCFullYear(), utc.getUTCMonth() + 1, 0)),
  )
}

export function formatTimeInTimeZone(
  instant: Date,
  timeZone: string = MASTER_TIMEZONE,
): string {
  return new Intl.DateTimeFormat('ru-BY', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(instant)
}
