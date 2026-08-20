import { describe, expect, it, vi } from 'vitest'

import { DomainError } from '@/common/errors/domain-error'
import type { MasterProfileStore } from '@/modules/master-profile/app/master-profile.ports'
import { UpdateMasterContactsUseCase } from '@/modules/master-profile/app/update-master-contacts.usecase'

describe('UpdateMasterContactsUseCase', () => {
  const currentUser = {
    id: 'u1',
    role: 'master' as const,
    email: 'master.smoke.1@example.com',
  }

  const profile = {
    id: 'm1',
    userId: 'u1',
    slug: 'anna-nails',
    displayName: 'Anna',
    headline: null,
    bio: null,
    status: 'draft' as const,
    experienceSince: null,
    languages: null,
    locations: [],
    contact: null,
  }

  it('upserts public contact fields and omits private keys', async () => {
    const profiles: MasterProfileStore = {
      findByUserId: vi.fn().mockResolvedValue(profile),
      isSlugTaken: vi.fn(),
      updateProfile: vi.fn(),
      upsertPrimaryLocation: vi.fn(),
      upsertContact: vi.fn().mockResolvedValue({
        ...profile,
        contact: {
          publicPhone: '+375291112233',
          instagram: 'anna.nails',
          telegramUsername: 'anna_nails',
          website: 'https://anna.example',
        },
      }),
    }

    const useCase = new UpdateMasterContactsUseCase(profiles)
    const result = await useCase.execute(currentUser, {
      publicPhone: '+375291112233',
      instagram: 'anna.nails',
      telegramUsername: 'anna_nails',
      website: 'https://anna.example',
    })

    expect(profiles.upsertContact).toHaveBeenCalledWith('m1', {
      publicPhone: '+375291112233',
      instagram: 'anna.nails',
      telegramUsername: 'anna_nails',
      website: 'https://anna.example',
    })
    expect(result.contact).toEqual({
      publicPhone: '+375291112233',
      instagram: 'anna.nails',
      telegramUsername: 'anna_nails',
      website: 'https://anna.example',
    })
    expect(JSON.stringify(result)).not.toContain('preferredChannel')
    expect(JSON.stringify(result)).not.toContain('trustScore')
    expect(JSON.stringify(result)).not.toContain('addressExact')
  })

  it('rejects when the master profile is missing', async () => {
    const profiles: MasterProfileStore = {
      findByUserId: vi.fn().mockResolvedValue(null),
      isSlugTaken: vi.fn(),
      updateProfile: vi.fn(),
      upsertPrimaryLocation: vi.fn(),
      upsertContact: vi.fn(),
    }

    const useCase = new UpdateMasterContactsUseCase(profiles)

    await expect(
      useCase.execute(currentUser, { instagram: 'anna.nails' }),
    ).rejects.toBeInstanceOf(DomainError)

    expect(profiles.upsertContact).not.toHaveBeenCalled()
  })
})
