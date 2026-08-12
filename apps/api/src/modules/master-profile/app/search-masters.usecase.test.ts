import { describe, expect, it, vi } from 'vitest'

import { SearchMastersUseCase } from '@/modules/master-profile/app/search-masters.usecase'
import type { PublicMasterStore } from '@/modules/master-profile/app/public-master.ports'

describe('SearchMastersUseCase', () => {
  it('maps published masters from the store', async () => {
    const masters: PublicMasterStore = {
      findPublicBySlug: vi.fn(),
      searchPublished: vi.fn().mockResolvedValue([
        {
          id: '11111111-1111-4111-8111-111111111111',
          slug: 'anna-a1b2c3',
          displayName: 'Анна',
          headline: null,
          boostPriority: 0,
          locations: [
            {
              isPrimary: true,
              district: { name: 'Центр', slug: 'centr' },
            },
          ],
          services: [{ category: { name: 'Ногти', slug: 'nogti' } }],
          stats: {
            ratingAvg: 4.8,
            ratingCount: 3,
            priceMin: 40,
          },
        },
      ]),
    }

    const useCase = new SearchMastersUseCase(masters)
    const result = await useCase.execute({ category: 'nogti' })

    expect(masters.searchPublished).toHaveBeenCalledWith({ category: 'nogti' })
    expect(result.items).toHaveLength(1)
    expect(result.items[0]?.slug).toBe('anna-a1b2c3')
    expect(result.items[0]?.priceFrom).toBe(40)
  })
})
