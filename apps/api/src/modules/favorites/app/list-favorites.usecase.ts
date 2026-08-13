import { Inject, Injectable } from '@nestjs/common'
import type { FavoriteListResponse } from '@lustra/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import type { FavoriteStore } from '@/modules/favorites/app/favorites.ports'
import { FavoriteRepository } from '@/modules/favorites/infra/favorite.repository'
import type { PublicMasterStore } from '@/modules/master-profile/app/public-master.ports'
import { toCatalogMasterCard } from '@/modules/master-profile/domain/map-catalog-master'
import { PublicMasterRepository } from '@/modules/master-profile/infra/public-master.repository'

@Injectable()
export class ListFavoritesUseCase {
  constructor(
    @Inject(FavoriteRepository)
    private readonly favorites: FavoriteStore,
    @Inject(PublicMasterRepository)
    private readonly masters: PublicMasterStore,
  ) {}

  async execute(currentUser: AuthUser): Promise<FavoriteListResponse> {
    const masterIds = await this.favorites.listMasterIds(currentUser.id)
    const records = await this.masters.listPublishedByIds(masterIds)
    const byId = new Map(records.map((record) => [record.id, record]))
    const items = masterIds.flatMap((masterId) => {
      const record = byId.get(masterId)

      if (!record) {
        return []
      }

      return [toCatalogMasterCard(record)]
    })

    return { items }
  }
}
