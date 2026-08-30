import { Inject, Injectable } from '@nestjs/common'
import type {
  MasterProfileView,
  PatchMasterContactInput,
} from '@lumira/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import type { MasterProfileStore } from '@/modules/master-profile/app/master-profile.ports'
import { toMasterProfileView } from '@/modules/master-profile/domain/map-master-profile'
import { MasterProfileRepository } from '@/modules/master-profile/infra/master-profile.repository'

@Injectable()
export class UpdateMasterContactsUseCase {
  constructor(
    @Inject(MasterProfileRepository)
    private readonly profiles: MasterProfileStore,
  ) {}

  async execute(
    currentUser: AuthUser,
    input: PatchMasterContactInput,
  ): Promise<MasterProfileView> {
    const profile = await this.profiles.findByUserId(currentUser.id)

    if (!profile) {
      throw new DomainError('NOT_FOUND', 'Профиль мастера не найден')
    }

    const updated = await this.profiles.upsertContact(profile.id, {
      publicPhone: input.publicPhone,
      instagram: input.instagram,
      telegramUsername: input.telegramUsername,
      website: input.website,
    })

    return toMasterProfileView(updated)
  }
}
