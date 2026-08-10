import { Injectable } from '@nestjs/common'
import type { MeResponse } from '@lustra/contracts'

import type { AuthUser } from '../../../common/auth/auth-user'
import { DomainError } from '../../../common/errors/domain-error'
import { toAuthUserView } from '../domain/map-auth-user'
import { AuthUserRepository } from '../infra/auth-user.repository'

@Injectable()
export class GetMeUseCase {
  constructor(private readonly users: AuthUserRepository) {}

  async execute(actor: AuthUser): Promise<MeResponse> {
    const user = await this.users.findById(actor.id)
    if (!user || user.status !== 'active' || user.deletedAt) {
      throw new DomainError('UNAUTHENTICATED', 'Требуется вход')
    }
    return toAuthUserView(user)
  }
}
