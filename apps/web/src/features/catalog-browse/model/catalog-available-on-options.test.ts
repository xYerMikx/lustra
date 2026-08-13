import { describe, expect, it } from 'vitest'

import { catalogAvailableOnOptions } from '@/features/catalog-browse/model/catalog-available-on-options'

describe('catalogAvailableOnOptions', () => {
  it('offers today and tomorrow in Europe/Minsk', () => {
    const options = catalogAvailableOnOptions(
      new Date('2026-08-13T22:00:00.000Z'),
    )

    expect(options.map((item) => item.value)).toEqual([
      '',
      '2026-08-14',
      '2026-08-15',
    ])
  })

  it('keeps a shared date that is not today or tomorrow', () => {
    const options = catalogAvailableOnOptions(
      new Date('2026-08-13T22:00:00.000Z'),
      '2026-08-20',
    )

    expect(options.at(-1)).toEqual({
      value: '2026-08-20',
      label: '2026-08-20',
    })
  })
})
