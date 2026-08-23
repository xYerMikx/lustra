import { Controller, Get, UseGuards } from '@nestjs/common'

import type { AuthUser } from '@/common/auth/auth-user'
import { CurrentUser } from '@/common/auth/current-user.decorator'
import { JwtGuard } from '@/common/auth/jwt.guard'
import { Roles } from '@/common/auth/roles.decorator'
import { RolesGuard } from '@/common/auth/roles.guard'
import { ListClientReviewsUseCase } from '@/modules/reviews/app/list-client-reviews.usecase'

@Controller('client/reviews')
@UseGuards(JwtGuard, RolesGuard)
@Roles('client')
export class ClientReviewsController {
  constructor(private readonly listReviews: ListClientReviewsUseCase) {}

  @Get()
  list(@CurrentUser() currentUser: AuthUser) {
    return this.listReviews.execute(currentUser)
  }
}