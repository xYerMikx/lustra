import type { AvailabilityRuleInput } from '@lustra/contracts'

export const WEEKDAY_LABELS = [
  { weekday: 1 as const, label: 'Пн' },
  { weekday: 2 as const, label: 'Вт' },
  { weekday: 3 as const, label: 'Ср' },
  { weekday: 4 as const, label: 'Чт' },
  { weekday: 5 as const, label: 'Пт' },
  { weekday: 6 as const, label: 'Сб' },
  { weekday: 7 as const, label: 'Вс' },
]

export type SchedulePresetId = 'weekdays-10-20' | 'sat-11-18' | 'clear'

export const SCHEDULE_PRESETS: Array<{
  id: SchedulePresetId
  label: string
  build: () => AvailabilityRuleInput[]
}> = [
  {
    id: 'weekdays-10-20',
    label: 'Будни 10:00–20:00',
    build: () =>
      ([1, 2, 3, 4, 5] as const).map((weekday) => ({
        weekday,
        startMin: 600,
        endMin: 1200,
      })),
  },
  {
    id: 'sat-11-18',
    label: 'Сб 11:00–18:00',
    build: () => [{ weekday: 6, startMin: 660, endMin: 1080 }],
  },
  {
    id: 'clear',
    label: 'Очистить',
    build: () => [],
  },
]

export function minutesToTimeInput(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

export function timeInputToMinutes(value: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value)

  if (!match) {
    return null
  }

  const hours = Number(match[1])
  const mins = Number(match[2])

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(mins) ||
    hours < 0 ||
    hours > 23 ||
    mins < 0 ||
    mins > 59
  ) {
    return null
  }

  return hours * 60 + mins
}

export type DayScheduleDraft = {
  enabled: boolean
  startMin: number
  endMin: number
}

export function rulesToDayDrafts(
  rules: AvailabilityRuleInput[],
): Record<number, DayScheduleDraft> {
  const drafts: Record<number, DayScheduleDraft> = {}

  for (const day of WEEKDAY_LABELS) {
    drafts[day.weekday] = {
      enabled: false,
      startMin: 600,
      endMin: 1200,
    }
  }

  for (const rule of rules) {
    const current = drafts[rule.weekday]

    if (!current) {
      continue
    }

    if (!current.enabled) {
      drafts[rule.weekday] = {
        enabled: true,
        startMin: rule.startMin,
        endMin: rule.endMin,
      }

      continue
    }

    drafts[rule.weekday] = {
      enabled: true,
      startMin: Math.min(current.startMin, rule.startMin),
      endMin: Math.max(current.endMin, rule.endMin),
    }
  }

  return drafts
}

export function dayDraftsToRules(
  drafts: Record<number, DayScheduleDraft>,
): AvailabilityRuleInput[] {
  const rules: AvailabilityRuleInput[] = []

  for (const day of WEEKDAY_LABELS) {
    const draft = drafts[day.weekday]

    if (!draft?.enabled) {
      continue
    }

    rules.push({
      weekday: day.weekday,
      startMin: draft.startMin,
      endMin: draft.endMin,
    })
  }

  return rules
}
