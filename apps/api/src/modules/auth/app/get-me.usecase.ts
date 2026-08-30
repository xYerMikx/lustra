import { Injectable } from '@nestjs/common'
import type { MeResponse } from '@lumira/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import { toAuthUserView } from '@/modules/auth/domain/map-auth-user'
import { AuthUserRepository } from '@/modules/auth/infra/auth-user.repository'

@Injectable()
export class GetMeUseCase {
  constructor(private readonly users: AuthUserRepository) {}

  async execute(currentUser: AuthUser): Promise<MeResponse> {
    const user = await this.users.findById(currentUser.id)

    if (!user || user.status !== 'active' || user.deletedAt) {
      throw new DomainError('UNAUTHENTICATED', 'Требуется вход')
    }

    return toAuthUserView(user)
  }
}
