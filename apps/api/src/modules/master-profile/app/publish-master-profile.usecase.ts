import { Inject, Injectable } from '@nestjs/common'
import type { MasterProfileView } from '@lustra/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import { AuthUserRepository } from '@/modules/auth/infra/auth-user.repository'
import type {
  EmailVerificationReader,
  MasterProfileStore,
} from '@/modules/master-profile/app/master-profile.ports'
import { toMasterProfileView } from '@/modules/master-profile/domain/map-master-profile'
import { MasterProfileRepository } from '@/modules/master-profile/infra/master-profile.repository'

@Injectable()
export class PublishMasterProfileUseCase {
  constructor(
    @Inject(MasterProfileRepository)
    private readonly profiles: MasterProfileStore,
    @Inject(AuthUserRepository)
    private readonly emails: EmailVerificationReader,
  ) {}

  async execute(currentUser: AuthUser): Promise<MasterProfileView> {
    if (currentUser.role !== 'master') {
      throw new DomainError('FORBIDDEN', 'Недостаточно прав')
    }

    const profile = await this.profiles.findByUserId(currentUser.id)

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

    const emailVerified = await this.emails.isEmailVerified(currentUser.id)

    if (!emailVerified) {
      throw DomainError.invalidState(
        'Подтвердите email, чтобы отправить профиль на проверку',
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
