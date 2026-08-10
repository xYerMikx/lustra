import { Injectable } from '@nestjs/common'
import type { MasterProfileView } from '@lustra/contracts'

import type { AuthUser } from '../../../common/auth/auth-user'
import { DomainError } from '../../../common/errors/domain-error'
import { toMasterProfileView } from '../domain/map-master-profile'
import { MasterProfileRepository } from '../infra/master-profile.repository'

@Injectable()
export class GetMasterProfileUseCase {
  constructor(private readonly profiles: MasterProfileRepository) {}

  async execute(actor: AuthUser): Promise<MasterProfileView> {
    const profile = await this.profiles.findByUserId(actor.id)
    if (!profile) {
      throw new DomainError('NOT_FOUND', 'Профиль мастера не найден')
    }

    return toMasterProfileView(profile)
  }
}
