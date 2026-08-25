import { describe, expect, it } from 'vitest'
import { createElement } from 'react'

import { collectTabValues } from '@/shared/ui/tabs/collect-tab-values'

describe('collectTabValues', () => {
  it('reads value props from tab children', () => {
    expect(
      collectTabValues([
        createElement('button', { value: 'day', key: 'day' }),
        createElement('button', { value: 'week', key: 'week' }),
      ]),
    ).toEqual(['day', 'week'])
  })
})
