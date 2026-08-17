const TIMEZONE = 'Europe/Minsk'

function pad2(value: number): string {
  return String(value).padStart(2, '0')
}

function getTimeZoneOffsetMs(instant: Date, timeZone: string): number {
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

export function todayYmd(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

export function addDaysYmd(ymdDate: string, days: number): string {
  const [year, month, day] = ymdDate.split('-').map(Number)
  const utc = new Date(Date.UTC(year!, month! - 1, day! + days))

  return `${utc.getUTCFullYear()}-${pad2(utc.getUTCMonth() + 1)}-${pad2(utc.getUTCDate())}`
}

export function zonedLocalToUtc(ymdDate: string, minuteOfDay: number): Date {
  const hours = Math.floor(minuteOfDay / 60)
  const minutes = minuteOfDay % 60
  const guess = new Date(`${ymdDate}T${pad2(hours)}:${pad2(minutes)}:00.000Z`)
  const offsetMs = getTimeZoneOffsetMs(guess, TIMEZONE)

  return new Date(guess.getTime() - offsetMs)
}

export function slotIso(ymdDate: string, hour: number, durationMin = 90): {
  startsAt: string
  endsAt: string
} {
  const starts = zonedLocalToUtc(ymdDate, hour * 60)
  const ends = new Date(starts.getTime() + durationMin * 60_000)

  return {
    startsAt: starts.toISOString(),
    endsAt: ends.toISOString(),
  }
}
