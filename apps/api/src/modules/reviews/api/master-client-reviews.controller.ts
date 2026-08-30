import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common'
import {
  CreateMasterClientReviewInputSchema,
  type CreateMasterClientReviewInput,
} from '@lumira/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { CurrentUser } from '@/common/auth/current-user.decorator'
import { JwtGuard } from '@/common/auth/jwt.guard'
import { Roles } from '@/common/auth/roles.decorator'
import { RolesGuard } from '@/common/auth/roles.guard'
import { ZodValidationPipe } from '@/common/auth/zod-validation.pipe'
import { CreateMasterClientReviewUseCase } from '@/modules/reviews/app/create-master-client-review.usecase'

@Controller('master/client-reviews')
@UseGuards(JwtGuard, RolesGuard)
@Roles('master')
export class MasterClientReviewsController {
  constructor(
    private readonly createReview: CreateMasterClientReviewUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  create(
    @CurrentUser() currentUser: AuthUser,
    @Body(new ZodValidationPipe(CreateMasterClientReviewInputSchema))
    body: CreateMasterClientReviewInput,
  ) {
    return this.createReview.execute(currentUser, body)
  }
}