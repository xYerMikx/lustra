import { describe, expect, it } from 'vitest'

import {
  clientContactLine,
  visitsLabel,
} from '@/features/master-clients/model/client-row-copy'

describe('client row copy', () => {
  it('joins phone and @handle', () => {
    expect(
      clientContactLine({ phone: '+37529111', socialHandle: 'anna.nails' }),
    ).toBe('+37529111 · @anna.nails')
  })

  it('picks Russian plural for visit counts', () => {
    expect(visitsLabel(0)).toBe('0 визитов')
    expect(visitsLabel(1)).toBe('1 визит')
    expect(visitsLabel(2)).toBe('2 визита')
    expect(visitsLabel(5)).toBe('5 визитов')
    expect(visitsLabel(21)).toBe('21 визит')
  })
})
