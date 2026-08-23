import {
  MASTER_TIMEZONE,
  addDaysToYmdDate,
  eachYmdDate,
  formatYmdDateInTimeZone,
  isoWeekdayForYmdDate,
  maxYmdDate,
  minYmdDate,
  zonedLocalToUtc,
} from '@/modules/scheduling/domain/tz'

export type ScheduleRuleInput = {
  weekday: number
  startMin: number
  endMin: number
  activeFrom?: Date | null
  activeTo?: Date | null
}

export type LocalInterval = {
  startMin: number
  endMin: number
}

export type TimeBlockInput = {
  startsAt: Date
  endsAt: Date
}

export type ScheduleExceptionInput = {
  ymdDate: string
  type: 'day_off' | 'custom_hours'
  startMin?: number | null
  endMin?: number | null
  granularityMin?: number | null
  intervals?: LocalInterval[] | null
}

export type GeneratedSlotStart = {
  startsAt: Date
  granularityMin: number
}

export type GenerateSlotStartsInput = {
  now: Date
  fromYmdDate: string
  toYmdDate: string
  granularityMin: number
  maxHorizonDays: number
  rules: ScheduleRuleInput[]
  exceptions: ScheduleExceptionInput[]
  blocks: TimeBlockInput[]
  timeZone?: string
}

/**
 * Pure SlotGenerator core: local rules/exceptions/blocks → UTC TimeSlot starts.
 * Grid aligns to each working interval start (not midnight).
 */
export function generateSlotStarts(
  input: GenerateSlotStartsInput,
): GeneratedSlotStart[] {
  const timeZone = input.timeZone ?? MASTER_TIMEZONE
  const todayYmdDate = formatYmdDateInTimeZone(input.now, timeZone)
  const horizonEndYmdDate = addDaysToYmdDate(todayYmdDate, input.maxHorizonDays)
  const rangeStart = maxYmdDate(input.fromYmdDate, todayYmdDate)
  const rangeEnd = minYmdDate(input.toYmdDate, horizonEndYmdDate)

  if (rangeStart > rangeEnd) {
    return []
  }

  const exceptionByDate = new Map(
    input.exceptions.map((item) => [item.ymdDate, item]),
  )
  const starts: GeneratedSlotStart[] = []

  for (const ymdDate of eachYmdDate(rangeStart, rangeEnd)) {
    const exception = exceptionByDate.get(ymdDate)
    const stepMin = exception?.granularityMin ?? input.granularityMin
    const intervals = resolveDayIntervals(
      ymdDate,
      input.rules,
      exceptionByDate,
      timeZone,
    )
    const dayStartUtc = zonedLocalToUtc(ymdDate, 0, timeZone)
    const dayEndUtc = zonedLocalToUtc(addDaysToYmdDate(ymdDate, 1), 0, timeZone)
    const dayBlocks = input.blocks.filter(
      (block) => block.startsAt < dayEndUtc && block.endsAt > dayStartUtc,
    )

    for (const interval of intervals) {
      const freeParts = subtractBlocksFromInterval(
        ymdDate,
        interval,
        dayBlocks,
        timeZone,
      )

      for (const part of freeParts) {
        for (
          let cursor = part.startMin;
          cursor + stepMin <= part.endMin;
          cursor += stepMin
        ) {
          starts.push({
            startsAt: zonedLocalToUtc(ymdDate, cursor, timeZone),
            granularityMin: stepMin,
          })
        }
      }
    }
  }

  return starts
}

function resolveDayIntervals(
  ymdDate: string,
  rules: ScheduleRuleInput[],
  exceptionByDate: Map<string, ScheduleExceptionInput>,
  timeZone: string,
): LocalInterval[] {
  const exception = exceptionByDate.get(ymdDate)

  if (exception?.type === 'day_off') {
    return []
  }

  if (exception?.type === 'custom_hours') {
    return normalizeExceptionIntervals(exception)
  }

  const weekday = isoWeekdayForYmdDate(ymdDate, timeZone)
  const dayRules = rules.filter((rule) => {
    if (rule.weekday !== weekday) {
      return false
    }

    if (rule.activeFrom) {
      const fromYmdDate = formatYmdDateInTimeZone(rule.activeFrom, timeZone)

      if (ymdDate < fromYmdDate) {
        return false
      }
    }

    if (rule.activeTo) {
      const toYmdDate = formatYmdDateInTimeZone(rule.activeTo, timeZone)

      if (ymdDate > toYmdDate) {
        return false
      }
    }

    return true
  })

  return dayRules
    .map((rule) => ({ startMin: rule.startMin, endMin: rule.endMin }))
    .sort((a, b) => a.startMin - b.startMin)
}

function normalizeExceptionIntervals(
  exception: ScheduleExceptionInput,
): LocalInterval[] {
  if (exception.intervals && exception.intervals.length > 0) {
    return [...exception.intervals]
      .filter((item) => item.endMin > item.startMin)
      .sort((left, right) => left.startMin - right.startMin)
  }

  if (
    exception.startMin == null ||
    exception.endMin == null ||
    exception.endMin <= exception.startMin
  ) {
    return []
  }

  return [{ startMin: exception.startMin, endMin: exception.endMin }]
}

function subtractBlocksFromInterval(
  ymdDate: string,
  interval: LocalInterval,
  blocks: TimeBlockInput[],
  timeZone: string,
): LocalInterval[] {
  let parts: LocalInterval[] = [interval]

  for (const block of blocks) {
    const blockStartMin = utcToLocalMinuteOfDay(block.startsAt, ymdDate, timeZone)
    const blockEndMin = utcToLocalMinuteOfDay(block.endsAt, ymdDate, timeZone)
    const next: LocalInterval[] = []

    for (const part of parts) {
      const missesBlock =
        blockEndMin <= part.startMin || blockStartMin >= part.endMin

      if (missesBlock) {
        next.push(part)
      } else {
        if (blockStartMin > part.startMin) {
          next.push({ startMin: part.startMin, endMin: blockStartMin })
        }

        if (blockEndMin < part.endMin) {
          next.push({ startMin: blockEndMin, endMin: part.endMin })
        }
      }
    }

    parts = next.filter((part) => part.endMin > part.startMin)
  }

  return parts
}

function utcToLocalMinuteOfDay(
  instant: Date,
  ymdDate: string,
  timeZone: string,
): number {
  const dayStart = zonedLocalToUtc(ymdDate, 0, timeZone)
  const dayEnd = zonedLocalToUtc(addDaysToYmdDate(ymdDate, 1), 0, timeZone)

  if (instant <= dayStart) {
    return 0
  }

  if (instant >= dayEnd) {
    return 24 * 60
  }

  return Math.round((instant.getTime() - dayStart.getTime()) / 60_000)
}
