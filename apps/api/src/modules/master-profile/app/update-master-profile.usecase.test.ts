import { describe, expect, it, vi } from 'vitest'

import { DomainError } from '@/common/errors/domain-error'
import type {
  DistrictStore,
  MasterProfileStore,
} from '@/modules/master-profile/app/master-profile.ports'
import { UpdateMasterProfileUseCase } from '@/modules/master-profile/app/update-master-profile.usecase'

describe('UpdateMasterProfileUseCase', () => {
  const currentUser = { id: 'u1', role: 'master' as const, email: 'm@example.com' }

  function buildProfile(
    overrides: Partial<{
      slug: string
      displayName: string
    }> = {},
  ) {
    return {
      id: 'm1',
      userId: 'u1',
      slug: overrides.slug ?? 'anna-a1b2',
      displayName: overrides.displayName ?? 'Anna',
      headline: null,
      bio: null,
      status: 'draft' as const,
      experienceSince: null,
      languages: null,
      locations: [],
      contact: null,
    }
  }

  it('regenerates slug when displayName changes and base slug collides', async () => {
    const profile = buildProfile()

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
      upsertContact: vi.fn(),
    }

    const districts: DistrictStore = {
      listAll: vi.fn(),
      findById: vi.fn(),
    }

    const useCase = new UpdateMasterProfileUseCase(profiles, districts)

    const result = await useCase.execute(currentUser, {
      displayName: 'Anna Nails',
    })

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

  it('sets explicit slug when available', async () => {
    const profile = buildProfile()

    const profiles: MasterProfileStore = {
      findByUserId: vi.fn().mockResolvedValue(profile),
      isSlugTaken: vi.fn().mockResolvedValue(false),
      updateProfile: vi.fn().mockImplementation(async (_id, data) => ({
        ...profile,
        ...data,
        locations: [],
      })),
      upsertPrimaryLocation: vi.fn(),
      upsertContact: vi.fn(),
    }

    const useCase = new UpdateMasterProfileUseCase(profiles, {
      listAll: vi.fn(),
      findById: vi.fn(),
    })

    const result = await useCase.execute(currentUser, {
      displayName: 'Anna Nails',
      slug: 'anna-custom',
    })

    expect(result.slug).toBe('anna-custom')
    expect(profiles.updateProfile).toHaveBeenCalledWith(
      'm1',
      expect.objectContaining({
        displayName: 'Anna Nails',
        slug: 'anna-custom',
      }),
    )
  })

  it('rejects taken explicit slug', async () => {
    const profile = buildProfile()

    const profiles: MasterProfileStore = {
      findByUserId: vi.fn().mockResolvedValue(profile),
      isSlugTaken: vi.fn().mockResolvedValue(true),
      updateProfile: vi.fn(),
      upsertPrimaryLocation: vi.fn(),
      upsertContact: vi.fn(),
    }

    const useCase = new UpdateMasterProfileUseCase(profiles, {
      listAll: vi.fn(),
      findById: vi.fn(),
    })

    await expect(
      useCase.execute(currentUser, { slug: 'taken-slug' }),
    ).rejects.toBeInstanceOf(DomainError)

    expect(profiles.updateProfile).not.toHaveBeenCalled()
  })
})
