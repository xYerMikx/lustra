import { Inject, Injectable } from '@nestjs/common'
import type { MasterProfileView } from '@lumira/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import { toMasterProfileView } from '@/modules/master-profile/domain/map-master-profile'
import { MasterProfileRepository } from '@/modules/master-profile/infra/master-profile.repository'
import type { MasterProfileStore } from '@/modules/master-profile/app/master-profile.ports'

@Injectable()
export class GetMasterProfileUseCase {
  constructor(
    @Inject(MasterProfileRepository)
    private readonly profiles: MasterProfileStore,
  ) {}

  async execute(currentUser: AuthUser): Promise<MasterProfileView> {
    const profile = await this.profiles.findByUserId(currentUser.id)

    if (!profile) {
      throw new DomainError('NOT_FOUND', 'Профиль мастера не найден')
    }

    return toMasterProfileView(profile)
  }
}
