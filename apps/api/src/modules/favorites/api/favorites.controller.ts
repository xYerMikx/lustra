import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common'

import type { AuthUser } from '@/common/auth/auth-user'
import { CurrentUser } from '@/common/auth/current-user.decorator'
import { JwtGuard } from '@/common/auth/jwt.guard'
import { Roles } from '@/common/auth/roles.decorator'
import { RolesGuard } from '@/common/auth/roles.guard'
import { AddFavoriteUseCase } from '@/modules/favorites/app/add-favorite.usecase'
import { GetFavoriteStatusUseCase } from '@/modules/favorites/app/get-favorite-status.usecase'
import { ListFavoritesUseCase } from '@/modules/favorites/app/list-favorites.usecase'
import { RemoveFavoriteUseCase } from '@/modules/favorites/app/remove-favorite.usecase'

@Controller('favorites')
@UseGuards(JwtGuard, RolesGuard)
@Roles('client')
export class FavoritesController {
  constructor(
    private readonly listFavorites: ListFavoritesUseCase,
    private readonly getFavoriteStatus: GetFavoriteStatusUseCase,
    private readonly addFavorite: AddFavoriteUseCase,
    private readonly removeFavorite: RemoveFavoriteUseCase,
  ) {}

  @Get()
  list(@CurrentUser() currentUser: AuthUser) {
    return this.listFavorites.execute(currentUser)
  }

  @Get(':masterId')
  getStatus(
    @CurrentUser() currentUser: AuthUser,
    @Param('masterId', ParseUUIDPipe) masterId: string,
  ) {
    return this.getFavoriteStatus.execute(currentUser, masterId)
  }

  @Post(':masterId')
  @HttpCode(200)
  add(
    @CurrentUser() currentUser: AuthUser,
    @Param('masterId', ParseUUIDPipe) masterId: string,
  ) {
    return this.addFavorite.execute(currentUser, masterId)
  }

  @Delete(':masterId')
  @HttpCode(200)
  remove(
    @CurrentUser() currentUser: AuthUser,
    @Param('masterId', ParseUUIDPipe) masterId: string,
  ) {
    return this.removeFavorite.execute(currentUser, masterId)
  }
}
