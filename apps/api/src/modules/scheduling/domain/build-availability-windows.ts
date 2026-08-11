import {
  MASTER_TIMEZONE,
  formatYmdInTimeZone,
} from '@/modules/scheduling/domain/tz'

export type OpenGranule = {
  id: string
  startsAt: Date
  endsAt: Date
}

export type BookableWindow = {
  startsAt: Date
  endsAt: Date
  slotIds: string[]
  dateYmd: string
}

export type BuildWindowsInput = {
  granules: OpenGranule[]
  durationMin: number
  bufferAfterMin: number
  granularityMin: number
  now: Date
  minLeadTimeMin: number
  timeZone?: string
}

/**
 * Builds service-length bookable windows from open granules.
 * Needs enough consecutive granules to cover duration + bufferAfter.
 * Displayed endsAt is startsAt + duration (buffer is occupancy only).
 */
export function buildBookableWindows(input: BuildWindowsInput): BookableWindow[] {
  const timeZone = input.timeZone ?? MASTER_TIMEZONE
  const needMin = input.durationMin + input.bufferAfterMin
  const needCount = Math.ceil(needMin / input.granularityMin)

  if (needCount <= 0 || input.granules.length === 0) {
    return []
  }

  const sorted = [...input.granules].sort(
    (a, b) => a.startsAt.getTime() - b.startsAt.getTime(),
  )
  const earliestStart = new Date(
    input.now.getTime() + input.minLeadTimeMin * 60_000,
  )
  const stepMs = input.granularityMin * 60_000
  const windows: BookableWindow[] = []

  for (let i = 0; i <= sorted.length - needCount; i += 1) {
    const slice = sorted.slice(i, i + needCount)
    const first = slice[0]
    const last = slice[slice.length - 1]

    if (!first || !last) {
      continue
    }

    if (!isConsecutive(slice, stepMs)) {
      continue
    }

    if (first.startsAt < earliestStart) {
      continue
    }

    const endsAt = new Date(first.startsAt.getTime() + input.durationMin * 60_000)

    windows.push({
      startsAt: first.startsAt,
      endsAt,
      slotIds: slice.map((item) => item.id),
      dateYmd: formatYmdInTimeZone(first.startsAt, timeZone),
    })
  }

  return windows
}

function isConsecutive(slice: OpenGranule[], stepMs: number): boolean {
  for (let i = 1; i < slice.length; i += 1) {
    const prev = slice[i - 1]
    const current = slice[i]

    if (!prev || !current) {
      return false
    }

    if (current.startsAt.getTime() - prev.startsAt.getTime() !== stepMs) {
      return false
    }
  }

  return true
}
