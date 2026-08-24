import { describe, expect, it } from 'vitest'

import { formatDayLabel } from '@/features/master-cabinet/model/format-day-label'

describe('formatDayLabel', () => {
  it('formats a Minsk calendar date in short Russian', () => {
    expect(formatDayLabel('2026-08-24')).toBe('пн, 24 авг.')
  })
})
