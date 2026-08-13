import { Inject, Injectable } from '@nestjs/common'
import type { MasterProfileView } from '@lustra/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import type { MasterProfileStore } from '@/modules/master-profile/app/master-profile.ports'
import { toMasterProfileView } from '@/modules/master-profile/domain/map-master-profile'
import { MasterProfileRepository } from '@/modules/master-profile/infra/master-profile.repository'

@Injectable()
export class PublishMasterProfileUseCase {
  constructor(
    @Inject(MasterProfileRepository)
    private readonly profiles: MasterProfileStore,
  ) {}

  async execute(actor: AuthUser): Promise<MasterProfileView> {
    if (actor.role !== 'master') {
      throw new DomainError('FORBIDDEN', 'Недостаточно прав')
    }

    const profile = await this.profiles.findByUserId(actor.id)

    if (!profile) {
      throw new DomainError('NOT_FOUND', 'Профиль мастера не найден')
    }

    if (profile.status === 'pending_review') {
      return toMasterProfileView(profile)
    }

    if (profile.status !== 'draft') {
      throw new DomainError(
        'INVALID_STATE',
        'На проверку можно отправить только черновик',
      )
    }

    if (!profile.displayName.trim()) {
      throw new DomainError('VALIDATION_FAILED', 'Укажите имя профиля', {
        fieldErrors: { displayName: ['Укажите имя профиля'] },
      })
    }

    const updated = await this.profiles.updateProfile(profile.id, {
      status: 'pending_review',
    })

    return toMasterProfileView(updated)
  }
}
