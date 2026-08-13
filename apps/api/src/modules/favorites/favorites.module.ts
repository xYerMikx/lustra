import { Module } from '@nestjs/common'

import { PrismaModule } from '@/common/prisma/prisma.module'
import { AuthModule } from '@/modules/auth/auth.module'
import { FavoritesController } from '@/modules/favorites/api/favorites.controller'
import { AddFavoriteUseCase } from '@/modules/favorites/app/add-favorite.usecase'
import { GetFavoriteStatusUseCase } from '@/modules/favorites/app/get-favorite-status.usecase'
import { ListFavoritesUseCase } from '@/modules/favorites/app/list-favorites.usecase'
import { RemoveFavoriteUseCase } from '@/modules/favorites/app/remove-favorite.usecase'
import { FavoriteRepository } from '@/modules/favorites/infra/favorite.repository'
import { MasterProfileModule } from '@/modules/master-profile/master-profile.module'

@Module({
  imports: [PrismaModule, AuthModule, MasterProfileModule],
  controllers: [FavoritesController],
  providers: [
    FavoriteRepository,
    ListFavoritesUseCase,
    GetFavoriteStatusUseCase,
    AddFavoriteUseCase,
    RemoveFavoriteUseCase,
  ],
})
export class FavoritesModule {}
