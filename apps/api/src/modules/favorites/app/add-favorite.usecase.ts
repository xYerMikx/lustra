import { Inject, Injectable } from '@nestjs/common'
import type { FavoriteStatusResponse } from '@lumira/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import type { FavoriteStore } from '@/modules/favorites/app/favorites.ports'
import { FavoriteRepository } from '@/modules/favorites/infra/favorite.repository'
import type { PublicMasterStore } from '@/modules/master-profile/app/public-master.ports'
import { PublicMasterRepository } from '@/modules/master-profile/infra/public-master.repository'

@Injectable()
export class AddFavoriteUseCase {
  constructor(
    @Inject(FavoriteRepository)
    private readonly favorites: FavoriteStore,
    @Inject(PublicMasterRepository)
    private readonly masters: PublicMasterStore,
  ) {}

  async execute(
    currentUser: AuthUser,
    masterId: string,
  ): Promise<FavoriteStatusResponse> {
    const master = await this.masters.findPublishedById(masterId)

    if (!master) {
      throw DomainError.notFound('Мастер не найден')
    }

    await this.favorites.add(currentUser.id, masterId)

    return { favorited: true }
  }
}
