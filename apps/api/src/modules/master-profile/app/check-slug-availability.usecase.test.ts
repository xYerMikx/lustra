import { describe, expect, it, vi } from 'vitest'

import { CheckSlugAvailabilityUseCase } from '@/modules/master-profile/app/check-slug-availability.usecase'
import type { MasterProfileStore } from '@/modules/master-profile/app/master-profile.ports'

describe('CheckSlugAvailabilityUseCase', () => {
  const currentUser = { id: 'u1', role: 'master' as const, email: 'm@example.com' }

  it('returns available for own current slug', async () => {
    const profiles: MasterProfileStore = {
      findByUserId: vi.fn().mockResolvedValue({
        id: 'm1',
        slug: 'anna-nails',
      }),
      isSlugTaken: vi.fn(),
      updateProfile: vi.fn(),
      upsertPrimaryLocation: vi.fn(),
      upsertContact: vi.fn(),
    }

    const useCase = new CheckSlugAvailabilityUseCase(profiles)
    const result = await useCase.execute(currentUser, 'anna-nails')

    expect(result).toEqual({ slug: 'anna-nails', available: true })
    expect(profiles.isSlugTaken).not.toHaveBeenCalled()
  })

  it('returns unavailable when another master owns the slug', async () => {
    const profiles: MasterProfileStore = {
      findByUserId: vi.fn().mockResolvedValue({
        id: 'm1',
        slug: 'anna-nails',
      }),
      isSlugTaken: vi.fn().mockResolvedValue(true),
      updateProfile: vi.fn(),
      upsertPrimaryLocation: vi.fn(),
      upsertContact: vi.fn(),
    }

    const useCase = new CheckSlugAvailabilityUseCase(profiles)
    const result = await useCase.execute(currentUser, 'other-master')

    expect(result).toEqual({ slug: 'other-master', available: false })
    expect(profiles.isSlugTaken).toHaveBeenCalledWith('other-master', 'm1')
  })
})
