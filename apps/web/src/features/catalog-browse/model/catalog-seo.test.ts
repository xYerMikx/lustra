import { describe, expect, it } from 'vitest'

import {
  catalogCategoryDescription,
  catalogCategoryTitle,
  catalogIndexDescription,
  catalogIndexTitle,
} from '@/features/catalog-browse/model/catalog-seo'

describe('catalog SEO copy', () => {
  it('keeps the index title geo-specific and unique', () => {
    expect(catalogIndexTitle()).toContain('Минске')
    expect(catalogIndexDescription().length).toBeGreaterThan(80)
  })

  it('builds a category landing title from the service name', () => {
    expect(catalogCategoryTitle('Ногти')).toBe(
      'Ногти в Минске — запись к мастерам онлайн',
    )

    const description = catalogCategoryDescription('Ногти')

    expect(description).toContain('Ногти в Минске')
    expect(description.length).toBeGreaterThanOrEqual(120)
    expect(description.length).toBeLessThanOrEqual(160)
  })
})
