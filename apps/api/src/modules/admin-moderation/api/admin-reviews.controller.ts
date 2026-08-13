import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import {
  AdminListReviewsQuerySchema,
  ModerateReviewInputSchema,
  type AdminListReviewsQuery,
  type ModerateReviewInput,
} from '@lustra/contracts'
import type { FastifyRequest } from 'fastify'

import { AdminGuard } from '@/common/auth/admin.guard'
import { AdminIpAllowlistGuard } from '@/common/auth/admin-ip-allowlist.guard'
import type { AuthUser } from '@/common/auth/auth-user'
import { CurrentUser } from '@/common/auth/current-user.decorator'
import { JwtGuard } from '@/common/auth/jwt.guard'
import { Roles } from '@/common/auth/roles.decorator'
import { RolesGuard } from '@/common/auth/roles.guard'
import { ZodValidationPipe } from '@/common/auth/zod-validation.pipe'
import { ListAdminReviewsUseCase } from '@/modules/admin-moderation/app/list-admin-reviews.usecase'
import { ModerateReviewUseCase } from '@/modules/admin-moderation/app/moderate-review.usecase'

@Controller('admin/reviews')
@UseGuards(JwtGuard, AdminIpAllowlistGuard, AdminGuard, RolesGuard)
@Roles('admin')
export class AdminReviewsController {
  constructor(
    private readonly listReviews: ListAdminReviewsUseCase,
    private readonly moderateReview: ModerateReviewUseCase,
  ) {}

  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(AdminListReviewsQuerySchema))
    query: AdminListReviewsQuery,
  ) {
    return this.listReviews.execute(user, query)
  }

  @Post(':id/moderate')
  moderate(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(ModerateReviewInputSchema))
    body: ModerateReviewInput,
    @Req() request: FastifyRequest,
  ) {
    return this.moderateReview.execute(user, id, body, {
      ip: request.ip,
    })
  }
}
