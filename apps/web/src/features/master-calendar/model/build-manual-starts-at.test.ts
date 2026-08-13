import { describe, expect, it } from 'vitest'

import { buildManualStartsAt } from '@/features/master-calendar/model/build-manual-starts-at'

describe('buildManualStartsAt', () => {
  it('builds an ISO instant in Europe/Minsk', () => {
    expect(buildManualStartsAt('2026-08-20', '13:00')).toBe(
      '2026-08-20T10:00:00.000Z',
    )
  })

  it('returns null for a broken time', () => {
    expect(buildManualStartsAt('2026-08-20', '13')).toBeNull()
  })
})
