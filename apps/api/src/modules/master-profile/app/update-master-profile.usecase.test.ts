import { describe, expect, it, vi } from 'vitest'

import type {
  DistrictStore,
  MasterProfileStore,
} from '@/modules/master-profile/app/master-profile.ports'
import { UpdateMasterProfileUseCase } from '@/modules/master-profile/app/update-master-profile.usecase'

describe('UpdateMasterProfileUseCase', () => {
  it('regenerates slug when displayName changes and base slug collides', async () => {
    const profile = {
      id: 'm1',
      userId: 'u1',
      slug: 'anna-a1b2',
      displayName: 'Anna',
      headline: null,
      bio: null,
      status: 'draft' as const,
      experienceSince: null,
      languages: null,
      locations: [],
    }

    const profiles: MasterProfileStore = {
      findByUserId: vi.fn().mockResolvedValue(profile),
      isSlugTaken: vi
        .fn()
        .mockImplementation(async (slug: string, excludeId?: string) => {
          if (excludeId !== 'm1') {
            return false
          }

          return slug === 'anna-nails'
        }),
      updateProfile: vi.fn().mockImplementation(async (_id, data) => ({
        ...profile,
        ...data,
        locations: [],
      })),
      upsertPrimaryLocation: vi.fn(),
    }

    const districts: DistrictStore = {
      listAll: vi.fn(),
      findById: vi.fn(),
    }

    const useCase = new UpdateMasterProfileUseCase(profiles, districts)

    const result = await useCase.execute(
      { id: 'u1', role: 'master', email: 'm@example.com' },
      { displayName: 'Anna Nails' },
    )

    expect(result.displayName).toBe('Anna Nails')
    expect(result.slug.startsWith('anna-nails-')).toBe(true)
    expect(profiles.updateProfile).toHaveBeenCalledWith(
      'm1',
      expect.objectContaining({
        displayName: 'Anna Nails',
        slug: expect.stringMatching(/^anna-nails-/),
      }),
    )
  })
})
