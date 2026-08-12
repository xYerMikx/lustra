import { Inject, Injectable } from '@nestjs/common'
import type { MasterProfileView, PatchMasterProfileInput } from '@lustra/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import type {
  DistrictStore,
  MasterProfileStore,
  ProfileUpdateData,
} from '@/modules/master-profile/app/master-profile.ports'
import { toMasterProfileView } from '@/modules/master-profile/domain/map-master-profile'
import { resolveUniqueSlug } from '@/modules/master-profile/domain/resolve-unique-slug'
import { DistrictRepository } from '@/modules/master-profile/infra/district.repository'
import { MasterProfileRepository } from '@/modules/master-profile/infra/master-profile.repository'

@Injectable()
export class UpdateMasterProfileUseCase {
  constructor(
    @Inject(MasterProfileRepository)
    private readonly profiles: MasterProfileStore,
    @Inject(DistrictRepository)
    private readonly districts: DistrictStore,
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

    const profilePatch: ProfileUpdateData = {}

    if (input.displayName !== undefined) {
      profilePatch.displayName = input.displayName
    }

    if (input.slug !== undefined) {
      if (input.slug !== profile.slug) {
        const taken = await this.profiles.isSlugTaken(input.slug, profile.id)

        if (taken) {
          throw new DomainError('VALIDATION_FAILED', 'Ссылка уже занята', {
            fieldErrors: { slug: ['Этот адрес уже занят другим мастером'] },
          })
        }
      }

      profilePatch.slug = input.slug
    } else if (
      input.displayName !== undefined &&
      input.displayName !== profile.displayName
    ) {
      profilePatch.slug = await resolveUniqueSlug(input.displayName, (slug) =>
        this.profiles.isSlugTaken(slug, profile.id),
      )
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

    const touchesLocation =
      input.districtId !== undefined ||
      input.locationType !== undefined ||
      input.addressHint !== undefined

    if (touchesLocation) {
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
