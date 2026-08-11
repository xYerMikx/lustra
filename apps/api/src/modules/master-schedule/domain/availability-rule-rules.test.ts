import { describe, expect, it } from 'vitest'

import { DomainError } from '@/common/errors/domain-error'
import { assertAvailabilityRules } from '@/modules/master-schedule/domain/availability-rule-rules'

describe('assertAvailabilityRules', () => {
  it('allows empty schedule (all days off)', () => {
    expect(() => assertAvailabilityRules([])).not.toThrow()
  })

  it('allows empty weekday when other days have intervals', () => {
    expect(() =>
      assertAvailabilityRules([
        { weekday: 1, startMin: 600, endMin: 1200 },
        { weekday: 2, startMin: 600, endMin: 1200 },
      ]),
    ).not.toThrow()
  })

  it('allows up to three non-overlapping intervals on one day', () => {
    expect(() =>
      assertAvailabilityRules([
        { weekday: 1, startMin: 600, endMin: 780 },
        { weekday: 1, startMin: 780, endMin: 900 },
        { weekday: 1, startMin: 960, endMin: 1200 },
      ]),
    ).not.toThrow()
  })

  it('rejects more than three intervals on one weekday', () => {
    expect(() =>
      assertAvailabilityRules([
        { weekday: 3, startMin: 600, endMin: 700 },
        { weekday: 3, startMin: 700, endMin: 800 },
        { weekday: 3, startMin: 800, endMin: 900 },
        { weekday: 3, startMin: 900, endMin: 1000 },
      ]),
    ).toThrow(DomainError)
  })

  it('rejects overlapping intervals on the same weekday', () => {
    expect(() =>
      assertAvailabilityRules([
        { weekday: 5, startMin: 600, endMin: 900 },
        { weekday: 5, startMin: 840, endMin: 1200 },
      ]),
    ).toThrow(DomainError)
  })

  it('rejects inverted or out-of-range intervals', () => {
    expect(() =>
      assertAvailabilityRules([{ weekday: 1, startMin: 900, endMin: 600 }]),
    ).toThrow(DomainError)

    expect(() =>
      assertAvailabilityRules([{ weekday: 1, startMin: -1, endMin: 600 }]),
    ).toThrow(DomainError)

    expect(() =>
      assertAvailabilityRules([{ weekday: 1, startMin: 600, endMin: 1500 }]),
    ).toThrow(DomainError)
  })

  it('rejects invalid weekday', () => {
    expect(() =>
      assertAvailabilityRules([{ weekday: 0, startMin: 600, endMin: 1200 }]),
    ).toThrow(DomainError)

    expect(() =>
      assertAvailabilityRules([{ weekday: 8, startMin: 600, endMin: 1200 }]),
    ).toThrow(DomainError)
  })
})
