import { Controller, Get, UseGuards } from '@nestjs/common'

import type { AuthUser } from '@/common/auth/auth-user'
import { CurrentUser } from '@/common/auth/current-user.decorator'
import { JwtGuard } from '@/common/auth/jwt.guard'
import { Roles } from '@/common/auth/roles.decorator'
import { RolesGuard } from '@/common/auth/roles.guard'
import { GetClientRecommendationsUseCase } from '@/modules/recommendations/app/get-client-recommendations.usecase'

@Controller('client/recommendations')
@UseGuards(JwtGuard, RolesGuard)
@Roles('client')
export class ClientRecommendationsController {
  constructor(
    private readonly getRecommendations: GetClientRecommendationsUseCase,
  ) {}

  @Get()
  list(@CurrentUser() currentUser: AuthUser) {
    return this.getRecommendations.execute(currentUser)
  }
}
