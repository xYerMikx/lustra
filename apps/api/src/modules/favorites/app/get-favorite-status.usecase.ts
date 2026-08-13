import { Inject, Injectable } from '@nestjs/common'
import type { FavoriteStatusResponse } from '@lustra/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import type { FavoriteStore } from '@/modules/favorites/app/favorites.ports'
import { FavoriteRepository } from '@/modules/favorites/infra/favorite.repository'

@Injectable()
export class GetFavoriteStatusUseCase {
  constructor(
    @Inject(FavoriteRepository)
    private readonly favorites: FavoriteStore,
  ) {}

  async execute(
    currentUser: AuthUser,
    masterId: string,
  ): Promise<FavoriteStatusResponse> {
    const favorited = await this.favorites.has(currentUser.id, masterId)

    return { favorited }
  }
}
