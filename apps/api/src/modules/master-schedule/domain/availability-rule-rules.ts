import type { AvailabilityRuleInput } from '@lustra/contracts'

import { DomainError } from '@/common/errors/domain-error'

const MAX_INTERVALS_PER_DAY = 3

type Interval = { startMin: number; endMin: number }

/**
 * Domain invariants for weekly AvailabilityRule templates.
 * Empty weekdays (no intervals) are allowed — master is off that day.
 * Half-open intervals [start, end): touching endpoints do not overlap.
 */
export function assertAvailabilityRules(rules: AvailabilityRuleInput[]): void {
  const byWeekday = new Map<number, Interval[]>()

  for (const rule of rules) {
    if (rule.weekday < 1 || rule.weekday > 7) {
      throw new DomainError('VALIDATION_FAILED', 'День недели должен быть от 1 до 7', {
        fieldErrors: { rules: ['День недели должен быть от 1 (пн) до 7 (вс)'] },
      })
    }

    if (rule.startMin < 0 || rule.endMin > 1440 || rule.endMin <= rule.startMin) {
      throw new DomainError(
        'VALIDATION_FAILED',
        'Интервал должен быть в пределах суток и endMin > startMin',
        {
          fieldErrors: {
            rules: ['Интервал должен быть в пределах суток и endMin > startMin'],
          },
        },
      )
    }

    const dayRules = byWeekday.get(rule.weekday) ?? []
    dayRules.push({ startMin: rule.startMin, endMin: rule.endMin })
    byWeekday.set(rule.weekday, dayRules)
  }

  for (const [weekday, intervals] of byWeekday) {
    if (intervals.length > MAX_INTERVALS_PER_DAY) {
      throw new DomainError(
        'VALIDATION_FAILED',
        `Не больше ${MAX_INTERVALS_PER_DAY} интервалов в день`,
        {
          fieldErrors: {
            rules: [
              `День ${weekday}: не больше ${MAX_INTERVALS_PER_DAY} интервалов`,
            ],
          },
        },
      )
    }

    assertNoOverlaps(weekday, intervals)
  }
}

function assertNoOverlaps(weekday: number, intervals: Interval[]): void {
  const sorted = [...intervals].sort((a, b) => a.startMin - b.startMin)

  for (let i = 1; i < sorted.length; i += 1) {
    const prev = sorted[i - 1]
    const current = sorted[i]

    if (!prev || !current) {
      continue
    }

    if (current.startMin < prev.endMin) {
      throw new DomainError(
        'VALIDATION_FAILED',
        'Интервалы в один день не должны пересекаться',
        {
          fieldErrors: {
            rules: [
              `День ${weekday}: интервалы пересекаются (${formatMin(prev.startMin)}–${formatMin(prev.endMin)} и ${formatMin(current.startMin)}–${formatMin(current.endMin)})`,
            ],
          },
        },
      )
    }
  }
}

function formatMin(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}
