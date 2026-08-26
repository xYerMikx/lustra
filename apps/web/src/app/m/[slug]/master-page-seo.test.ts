import { describe, expect, it } from 'vitest'

import {
  masterPageDescription,
  masterPageShouldIndex,
  masterPageTitle,
} from '@/app/m/[slug]/master-page-seo'

describe('master page SEO', () => {
  it('puts the name and city in the title', () => {
    expect(masterPageTitle('Анна')).toBe('Анна — бьюти-мастер в Минске')
  })

  it('prefers headline in the description and keeps it short', () => {
    const description = masterPageDescription({
      displayName: 'Анна',
      headline: 'Маникюр и покрытие',
      bio: 'Длинное био, которое не должно попасть в сниппет.',
      districtName: 'Фрунзенский',
    })

    expect(description).toContain('Фрунзенский')
    expect(description).toContain('Маникюр')
    expect(description.length).toBeLessThanOrEqual(160)
  })

  it('noindexes drafts and thin profiles', () => {
    expect(
      masterPageShouldIndex({
        status: 'pending_review',
        serviceCount: 3,
        portfolioCount: 5,
      }),
    ).toBe(false)
    expect(
      masterPageShouldIndex({
        status: 'published',
        serviceCount: 0,
        portfolioCount: 5,
      }),
    ).toBe(false)
    expect(
      masterPageShouldIndex({
        status: 'published',
        serviceCount: 1,
        portfolioCount: 2,
      }),
    ).toBe(false)
    expect(
      masterPageShouldIndex({
        status: 'published',
        serviceCount: 1,
        portfolioCount: 3,
      }),
    ).toBe(true)
  })
})
