import { describe, expect, it } from 'vitest'

import { joinDotLabels } from '@/shared/lib/join-dot-labels'

describe('joinDotLabels', () => {
  it('skips empty labels so separators are not doubled', () => {
    expect(joinDotLabels(['Маникюр', 'Анна', '/m/anna'])).toBe(
      'Маникюр · Анна · /m/anna',
    )
    expect(joinDotLabels(['', 'Анна', '/m/anna'])).toBe('Анна · /m/anna')
    expect(joinDotLabels(['   ', null, 'Анна'])).toBe('Анна')
  })
})
