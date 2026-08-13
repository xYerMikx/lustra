import { describe, expect, it, vi } from 'vitest'

import { DomainError } from '@/common/errors/domain-error'
import { PublishMasterProfileUseCase } from '@/modules/master-profile/app/publish-master-profile.usecase'
import type {
  EmailVerificationReader,
  MasterProfileStore,
} from '@/modules/master-profile/app/master-profile.ports'

const draftProfile = {
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

function createProfiles(
  profile: typeof draftProfile | { status: string } & Partial<typeof draftProfile>,
): MasterProfileStore {
  return {
    findByUserId: vi.fn().mockResolvedValue(profile),
    isSlugTaken: vi.fn(),
    updateProfile: vi.fn().mockResolvedValue({
      ...draftProfile,
      ...profile,
      status: 'pending_review',
    }),
    upsertPrimaryLocation: vi.fn(),
  }
}

describe('PublishMasterProfileUseCase', () => {
  it('moves draft to pending_review when email is verified', async () => {
    const profiles = createProfiles(draftProfile)
    const emails: EmailVerificationReader = {
      isEmailVerified: vi.fn().mockResolvedValue(true),
    }

    const useCase = new PublishMasterProfileUseCase(profiles, emails)
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

  it('rejects publish when email is not verified', async () => {
    const profiles = createProfiles(draftProfile)
    const emails: EmailVerificationReader = {
      isEmailVerified: vi.fn().mockResolvedValue(false),
    }

    const useCase = new PublishMasterProfileUseCase(profiles, emails)

    await expect(
      useCase.execute({
        id: 'u1',
        role: 'master',
        email: 'm@example.com',
      }),
    ).rejects.toMatchObject({
      code: 'INVALID_STATE',
      message: 'Подтвердите email, чтобы отправить профиль на проверку',
    } satisfies Partial<DomainError>)
    expect(profiles.updateProfile).not.toHaveBeenCalled()
  })

  it('rejects non-draft statuses', async () => {
    const profiles = createProfiles({
      ...draftProfile,
      status: 'published',
    })
    const emails: EmailVerificationReader = {
      isEmailVerified: vi.fn().mockResolvedValue(true),
    }

    const useCase = new PublishMasterProfileUseCase(profiles, emails)

    await expect(
      useCase.execute({
        id: 'u1',
        role: 'master',
        email: 'm@example.com',
      }),
    ).rejects.toBeInstanceOf(DomainError)
    expect(emails.isEmailVerified).not.toHaveBeenCalled()
  })
})
