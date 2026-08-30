import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common'
import {
  ReplyToReviewInputSchema,
  type ReplyToReviewInput,
} from '@lumira/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { CurrentUser } from '@/common/auth/current-user.decorator'
import { JwtGuard } from '@/common/auth/jwt.guard'
import { Roles } from '@/common/auth/roles.decorator'
import { RolesGuard } from '@/common/auth/roles.guard'
import { ZodValidationPipe } from '@/common/auth/zod-validation.pipe'
import { ListMasterReviewsUseCase } from '@/modules/reviews/app/list-master-reviews.usecase'
import { ReplyToReviewUseCase } from '@/modules/reviews/app/reply-to-review.usecase'

@Controller('master/reviews')
@UseGuards(JwtGuard, RolesGuard)
@Roles('master')
export class MasterReviewsController {
  constructor(
    private readonly listReviews: ListMasterReviewsUseCase,
    private readonly replyToReview: ReplyToReviewUseCase,
  ) {}

  @Get()
  list(@CurrentUser() currentUser: AuthUser) {
    return this.listReviews.execute(currentUser)
  }

  @Post(':id/reply')
  @HttpCode(200)
  reply(
    @CurrentUser() currentUser: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(ReplyToReviewInputSchema))
    body: ReplyToReviewInput,
  ) {
    return this.replyToReview.execute(currentUser, id, body)
  }
}
