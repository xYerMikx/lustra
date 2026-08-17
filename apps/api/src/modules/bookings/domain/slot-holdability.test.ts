import { describe, expect, it } from 'vitest'

import {
  appointmentEndsAt,
  areSlotsConsecutive,
  granuleNeedCount,
  holdCoverageEndsAt,
  isSlotHoldable,
} from '@/modules/bookings/domain/slot-holdability'

describe('slot-holdability', () => {
  const now = new Date('2026-08-12T12:00:00.000Z')

  it('treats open slots as holdable', () => {
    expect(
      isSlotHoldable(
        {
          id: 's1',
          startsAt: now,
          endsAt: now,
          status: 'open',
          holdExpiresAt: null,
        },
        now,
      ),
    ).toBe(true)
  })

  it('treats expired held slots as holdable', () => {
    expect(
      isSlotHoldable(
        {
          id: 's1',
          startsAt: now,
          endsAt: now,
          status: 'held',
          holdExpiresAt: new Date('2026-08-12T11:59:00.000Z'),
        },
        now,
      ),
    ).toBe(true)
  })

  it('rejects active held and booked slots', () => {
    expect(
      isSlotHoldable(
        {
          id: 's1',
          startsAt: now,
          endsAt: now,
          status: 'held',
          holdExpiresAt: new Date('2026-08-12T12:10:00.000Z'),
        },
        now,
      ),
    ).toBe(false)

    expect(
      isSlotHoldable(
        {
          id: 's1',
          startsAt: now,
          endsAt: now,
          status: 'booked',
          holdExpiresAt: null,
        },
        now,
      ),
    ).toBe(false)
  })

  it('checks consecutive granules by step', () => {
    const a = new Date('2026-08-12T10:00:00.000Z')
    const b = new Date('2026-08-12T10:30:00.000Z')
    const c = new Date('2026-08-12T11:00:00.000Z')

    expect(
      areSlotsConsecutive(
        [
          { id: '1', startsAt: a, endsAt: b, status: 'open', holdExpiresAt: null },
          { id: '2', startsAt: b, endsAt: c, status: 'open', holdExpiresAt: null },
        ],
        30,
      ),
    ).toBe(true)

    expect(
      areSlotsConsecutive(
        [
          { id: '1', startsAt: a, endsAt: b, status: 'open', holdExpiresAt: null },
          { id: '2', startsAt: c, endsAt: c, status: 'open', holdExpiresAt: null },
        ],
        30,
      ),
    ).toBe(false)
  })

  it('computes granule need and ends', () => {
    expect(granuleNeedCount(90, 0, 30)).toBe(3)
    expect(granuleNeedCount(40, 10, 30)).toBe(2)

    const start = new Date('2026-08-12T10:00:00.000Z')

    expect(appointmentEndsAt(start, 90).toISOString()).toBe(
      '2026-08-12T11:30:00.000Z',
    )
    expect(holdCoverageEndsAt(start, 90, 30).toISOString()).toBe(
      '2026-08-12T12:00:00.000Z',
    )
  })
})
