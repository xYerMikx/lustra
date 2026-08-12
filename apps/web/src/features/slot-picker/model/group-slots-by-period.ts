import type { AvailabilitySlotView } from '@lustra/contracts'

import { MASTER_TIMEZONE, formatTimeInTimeZone } from '@/shared/lib/tz'

export type SlotPeriod = 'morning' | 'day' | 'evening'

export type GroupedSlots = {
  period: SlotPeriod
  label: string
  slots: AvailabilitySlotView[]
}

const PERIOD_LABELS: Record<SlotPeriod, string> = {
  morning: 'Утро',
  day: 'День',
  evening: 'Вечер',
}

export function periodForHour(hour: number): SlotPeriod {
  if (hour < 12) {
    return 'morning'
  }

  if (hour < 17) {
    return 'day'
  }

  return 'evening'
}

export function groupSlotsByPeriod(
  slots: AvailabilitySlotView[],
  timeZone: string = MASTER_TIMEZONE,
): GroupedSlots[] {
  const buckets: Record<SlotPeriod, AvailabilitySlotView[]> = {
    morning: [],
    day: [],
    evening: [],
  }

  for (const slot of slots) {
    const hour = Number(
      new Intl.DateTimeFormat('en-GB', {
        timeZone,
        hour: '2-digit',
        hour12: false,
      }).format(new Date(slot.startsAt)),
    )
    const period = periodForHour(Number.isFinite(hour) ? hour : 12)
    buckets[period].push(slot)
  }

  return (['morning', 'day', 'evening'] as const)
    .filter((period) => buckets[period].length > 0)
    .map((period) => ({
      period,
      label: PERIOD_LABELS[period],
      slots: buckets[period],
    }))
}

export function slotTimeLabel(
  startsAt: string,
  timeZone: string = MASTER_TIMEZONE,
): string {
  return formatTimeInTimeZone(new Date(startsAt), timeZone)
}
