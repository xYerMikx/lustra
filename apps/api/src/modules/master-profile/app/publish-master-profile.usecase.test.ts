import { describe, expect, it, vi } from 'vitest'

import { DomainError } from '@/common/errors/domain-error'
import { PublishMasterProfileUseCase } from '@/modules/master-profile/app/publish-master-profile.usecase'
import type { MasterProfileStore } from '@/modules/master-profile/app/master-profile.ports'

describe('PublishMasterProfileUseCase', () => {
  it('moves draft to pending_review', async () => {
    const profile = {
      id: 'm1',
      userId: 'u1',
      slug: 'anna',
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
      isSlugTaken: vi.fn(),
      updateProfile: vi.fn().mockResolvedValue({
        ...profile,
        status: 'pending_review',
      }),
      upsertPrimaryLocation: vi.fn(),
    }

    const useCase = new PublishMasterProfileUseCase(profiles)
    const result = await useCase.execute({
      id: 'u1',
      role: 'master',
      email: 'm@example.com',
    })

    expect(result.status).toBe('pending_review')
    expect(profiles.updateProfile).toHaveBeenCalledWith('m1', {
      status: 'pending_review',
    })
  })

  it('rejects non-draft statuses', async () => {
    const profiles: MasterProfileStore = {
      findByUserId: vi.fn().mockResolvedValue({
        id: 'm1',
        userId: 'u1',
        slug: 'anna',
        displayName: 'Anna',
        headline: null,
        bio: null,
        status: 'published',
        experienceSince: null,
        languages: null,
        locations: [],
      }),
      isSlugTaken: vi.fn(),
      updateProfile: vi.fn(),
      upsertPrimaryLocation: vi.fn(),
    }

    const useCase = new PublishMasterProfileUseCase(profiles)

    await expect(
      useCase.execute({
        id: 'u1',
        role: 'master',
        email: 'm@example.com',
      }),
    ).rejects.toBeInstanceOf(DomainError)
  })
})
