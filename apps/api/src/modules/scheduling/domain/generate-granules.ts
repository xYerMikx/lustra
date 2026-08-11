import {
  MASTER_TIMEZONE,
  addDaysYmd,
  eachYmd,
  formatYmdInTimeZone,
  isoWeekdayForYmd,
  maxYmd,
  minYmd,
  zonedLocalToUtc,
} from '@/modules/scheduling/domain/tz'

export type ScheduleRuleInput = {
  weekday: number
  startMin: number
  endMin: number
  activeFrom?: Date | null
  activeTo?: Date | null
}

export type ScheduleExceptionInput = {
  dateYmd: string
  type: 'day_off' | 'custom_hours'
  startMin?: number | null
  endMin?: number | null
}

export type TimeBlockInput = {
  startsAt: Date
  endsAt: Date
}

export type LocalInterval = {
  startMin: number
  endMin: number
}

export type GenerateGranulesInput = {
  now: Date
  fromYmd: string
  toYmd: string
  granularityMin: number
  maxHorizonDays: number
  rules: ScheduleRuleInput[]
  exceptions: ScheduleExceptionInput[]
  blocks: TimeBlockInput[]
  timeZone?: string
}

/**
 * Pure SlotGenerator core: local rules/exceptions/blocks → UTC granule starts.
 * Grid aligns to each working interval start (not midnight).
 */
export function generateGranuleStarts(input: GenerateGranulesInput): Date[] {
  const timeZone = input.timeZone ?? MASTER_TIMEZONE
  const todayYmd = formatYmdInTimeZone(input.now, timeZone)
  const horizonEndYmd = addDaysYmd(todayYmd, input.maxHorizonDays)
  const rangeStart = maxYmd(input.fromYmd, todayYmd)
  const rangeEnd = minYmd(input.toYmd, horizonEndYmd)

  if (rangeStart > rangeEnd) {
    return []
  }

  const exceptionByDate = new Map(
    input.exceptions.map((item) => [item.dateYmd, item]),
  )
  const starts: Date[] = []

  for (const ymd of eachYmd(rangeStart, rangeEnd)) {
    const intervals = resolveDayIntervals(
      ymd,
      input.rules,
      exceptionByDate,
      timeZone,
    )
    const dayStartUtc = zonedLocalToUtc(ymd, 0, timeZone)
    const dayEndUtc = zonedLocalToUtc(addDaysYmd(ymd, 1), 0, timeZone)
    const dayBlocks = input.blocks.filter(
      (block) => block.startsAt < dayEndUtc && block.endsAt > dayStartUtc,
    )

    for (const interval of intervals) {
      const freeParts = subtractBlocksFromInterval(
        ymd,
        interval,
        dayBlocks,
        timeZone,
      )

      for (const part of freeParts) {
        for (
          let cursor = part.startMin;
          cursor + input.granularityMin <= part.endMin;
          cursor += input.granularityMin
        ) {
          starts.push(zonedLocalToUtc(ymd, cursor, timeZone))
        }
      }
    }
  }

  return starts
}

function resolveDayIntervals(
  ymd: string,
  rules: ScheduleRuleInput[],
  exceptionByDate: Map<string, ScheduleExceptionInput>,
  timeZone: string,
): LocalInterval[] {
  const exception = exceptionByDate.get(ymd)

  if (exception?.type === 'day_off') {
    return []
  }

  if (exception?.type === 'custom_hours') {
    if (
      exception.startMin == null ||
      exception.endMin == null ||
      exception.endMin <= exception.startMin
    ) {
      return []
    }

    return [{ startMin: exception.startMin, endMin: exception.endMin }]
  }

  const weekday = isoWeekdayForYmd(ymd, timeZone)
  const dayRules = rules.filter((rule) => {
    if (rule.weekday !== weekday) {
      return false
    }

    if (rule.activeFrom) {
      const fromYmd = formatYmdInTimeZone(rule.activeFrom, timeZone)

      if (ymd < fromYmd) {
        return false
      }
    }

    if (rule.activeTo) {
      const toYmd = formatYmdInTimeZone(rule.activeTo, timeZone)

      if (ymd > toYmd) {
        return false
      }
    }

    return true
  })

  return dayRules
    .map((rule) => ({ startMin: rule.startMin, endMin: rule.endMin }))
    .sort((a, b) => a.startMin - b.startMin)
}

function subtractBlocksFromInterval(
  ymd: string,
  interval: LocalInterval,
  blocks: TimeBlockInput[],
  timeZone: string,
): LocalInterval[] {
  let parts: LocalInterval[] = [interval]

  for (const block of blocks) {
    const blockStartMin = utcToLocalMinuteOfDay(block.startsAt, ymd, timeZone)
    const blockEndMin = utcToLocalMinuteOfDay(block.endsAt, ymd, timeZone)
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
  ymd: string,
  timeZone: string,
): number {
  const dayStart = zonedLocalToUtc(ymd, 0, timeZone)
  const dayEnd = zonedLocalToUtc(addDaysYmd(ymd, 1), 0, timeZone)

  if (instant <= dayStart) {
    return 0
  }

  if (instant >= dayEnd) {
    return 24 * 60
  }

  return Math.round((instant.getTime() - dayStart.getTime()) / 60_000)
}
