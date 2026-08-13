import { Inject, Injectable } from '@nestjs/common'
import type { FavoriteStatusResponse } from '@lustra/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import type { FavoriteStore } from '@/modules/favorites/app/favorites.ports'
import { FavoriteRepository } from '@/modules/favorites/infra/favorite.repository'

@Injectable()
export class RemoveFavoriteUseCase {
  constructor(
    @Inject(FavoriteRepository)
    private readonly favorites: FavoriteStore,
  ) {}

  async execute(
    currentUser: AuthUser,
    masterId: string,
  ): Promise<FavoriteStatusResponse> {
    await this.favorites.remove(currentUser.id, masterId)

    return { favorited: false }
  }
}
