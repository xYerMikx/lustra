import { Inject, Injectable } from '@nestjs/common'
import type { CheckSlugAvailabilityResponse } from '@lustra/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import type { MasterProfileStore } from '@/modules/master-profile/app/master-profile.ports'
import { MasterProfileRepository } from '@/modules/master-profile/infra/master-profile.repository'

@Injectable()
export class CheckSlugAvailabilityUseCase {
  constructor(
    @Inject(MasterProfileRepository)
    private readonly profiles: MasterProfileStore,
  ) {}

  async execute(
    actor: AuthUser,
    slug: string,
  ): Promise<CheckSlugAvailabilityResponse> {
    const profile = await this.profiles.findByUserId(actor.id)

    if (!profile) {
      throw new DomainError('NOT_FOUND', 'Профиль мастера не найден')
    }

    if (slug === profile.slug) {
      return { slug, available: true }
    }

    const taken = await this.profiles.isSlugTaken(slug, profile.id)

    return {
      slug,
      available: !taken,
    }
  }
}
