import { Injectable } from '@nestjs/common'
import type { MasterProfileView, PatchMasterProfileInput } from '@lustra/contracts'

import type { AuthUser } from '../../../common/auth/auth-user'
import { DomainError } from '../../../common/errors/domain-error'
import { toMasterProfileView } from '../domain/map-master-profile'
import { resolveUniqueSlug } from '../domain/resolve-unique-slug'
import { DistrictRepository } from '../infra/district.repository'
import { MasterProfileRepository } from '../infra/master-profile.repository'

@Injectable()
export class UpdateMasterProfileUseCase {
  constructor(
    private readonly profiles: MasterProfileRepository,
    private readonly districts: DistrictRepository,
  ) {}

  async execute(
    actor: AuthUser,
    input: PatchMasterProfileInput,
  ): Promise<MasterProfileView> {
    const profile = await this.profiles.findByUserId(actor.id)
    if (!profile) {
      throw new DomainError('NOT_FOUND', 'Профиль мастера не найден')
    }

    if (input.districtId) {
      const district = await this.districts.findById(input.districtId)
      if (!district) {
        throw new DomainError('VALIDATION_FAILED', 'Район не найден', {
          fieldErrors: { districtId: ['Выберите район из списка'] },
        })
      }
    }

    const profilePatch: {
      displayName?: string
      headline?: string | null
      bio?: string | null
      slug?: string
    } = {}

    if (input.displayName !== undefined) {
      profilePatch.displayName = input.displayName
      if (input.displayName !== profile.displayName) {
        profilePatch.slug = await resolveUniqueSlug(input.displayName, (slug) =>
          this.profiles.isSlugTaken(slug, profile.id),
        )
      }
    }

    if (input.headline !== undefined) {
      profilePatch.headline = input.headline
    }

    if (input.bio !== undefined) {
      profilePatch.bio = input.bio
    }

    let updated = profile
    if (Object.keys(profilePatch).length > 0) {
      updated = await this.profiles.updateProfile(profile.id, profilePatch)
    }

    if (
      input.districtId !== undefined ||
      input.locationType !== undefined ||
      input.addressHint !== undefined
    ) {
      const primary =
        updated.locations.find((location) => location.isPrimary) ??
        updated.locations[0]

      const districtId = input.districtId ?? primary?.districtId
      if (!districtId) {
        throw new DomainError('VALIDATION_FAILED', 'Район обязателен', {
          fieldErrors: { districtId: ['Выберите район'] },
        })
      }

      updated = await this.profiles.upsertPrimaryLocation(profile.id, {
        districtId,
        type: input.locationType ?? primary?.type ?? 'salon',
        addressHint:
          input.addressHint !== undefined
            ? input.addressHint
            : (primary?.addressHint ?? null),
      })
    }

    return toMasterProfileView(updated)
  }
}
