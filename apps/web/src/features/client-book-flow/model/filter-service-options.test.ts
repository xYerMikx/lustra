import { describe, expect, it } from 'vitest'

import { filterServiceOptions } from '@/features/client-book-flow/model/filter-service-options'
import type { ClientBookServiceOption } from '@/features/client-book-flow/model/types'

function option(
  partial: Pick<ClientBookServiceOption, 'key' | 'title' | 'source'> &
    Partial<ClientBookServiceOption>,
): ClientBookServiceOption {
  return {
    categorySlug: null,
    serviceId: null,
    lastMaster: null,
    lastMasterId: null,
    ...partial,
  }
}

describe('filterServiceOptions', () => {
  it('filters catalog by category without hiding recommendations', () => {
    const options = [
      option({
        key: 'rec',
        title: 'Маникюр комбинированный',
        source: 'recommended',
      }),
      option({
        key: 'cat-nails',
        title: 'Педикюр',
        source: 'catalog',
        categorySlug: 'nogti',
      }),
      option({
        key: 'cat-brows',
        title: 'Коррекция бровей',
        source: 'catalog',
        categorySlug: 'brovi',
      }),
    ]

    const byCategory = filterServiceOptions(options, {
      query: '',
      categorySlug: 'brovi',
    })

    expect(byCategory.map((item) => item.key)).toEqual(['rec', 'cat-brows'])

    const byQuery = filterServiceOptions(options, {
      query: 'бров',
      categorySlug: null,
    })

    expect(byQuery.map((item) => item.key)).toEqual(['cat-brows'])
  })
})
