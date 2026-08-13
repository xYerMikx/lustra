import { describe, expect, it, vi } from 'vitest'

import { DomainError } from '@/common/errors/domain-error'
import { GetPublicMasterBySlugUseCase } from '@/modules/master-profile/app/get-public-master-by-slug.usecase'
import type { PublicMasterStore } from '@/modules/master-profile/app/public-master.ports'

describe('GetPublicMasterBySlugUseCase', () => {
  it('returns mapped public master for visible slug', async () => {
    const masters: PublicMasterStore = {
      findPublicBySlug: vi.fn().mockResolvedValue({
        id: '11111111-1111-4111-8111-111111111111',
        slug: 'anna-a1b2c3',
        displayName: 'Анна',
        headline: null,
        bio: null,
        status: 'pending_review',
        experienceSince: null,
        languages: null,
        locations: [],
        services: [],
        contact: null,
        stats: null,
        portfolio: [],
      }),
      searchPublished: vi.fn(),
    }

    const useCase = new GetPublicMasterBySlugUseCase(masters)
    const result = await useCase.execute('anna-a1b2c3')

    expect(result.slug).toBe('anna-a1b2c3')
    expect(result.status).toBe('pending_review')
    expect(masters.findPublicBySlug).toHaveBeenCalledWith('anna-a1b2c3')
  })

  it('returns NOT_FOUND for missing or non-public masters', async () => {
    const masters: PublicMasterStore = {
      findPublicBySlug: vi.fn().mockResolvedValue(null),
      searchPublished: vi.fn(),
    }

    const useCase = new GetPublicMasterBySlugUseCase(masters)

    await expect(useCase.execute('draft-only')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    } satisfies Partial<DomainError>)
  })
})
