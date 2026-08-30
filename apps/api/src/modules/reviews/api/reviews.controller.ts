import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common'
import {
  CreateReviewInputSchema,
  type CreateReviewInput,
} from '@lumira/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { CurrentUser } from '@/common/auth/current-user.decorator'
import { JwtGuard } from '@/common/auth/jwt.guard'
import { Roles } from '@/common/auth/roles.decorator'
import { RolesGuard } from '@/common/auth/roles.guard'
import { ZodValidationPipe } from '@/common/auth/zod-validation.pipe'
import { CreateReviewUseCase } from '@/modules/reviews/app/create-review.usecase'

@Controller('reviews')
@UseGuards(JwtGuard, RolesGuard)
@Roles('client')
export class ReviewsController {
  constructor(private readonly createReview: CreateReviewUseCase) {}

  @Post()
  @HttpCode(201)
  create(
    @CurrentUser() currentUser: AuthUser,
    @Body(new ZodValidationPipe(CreateReviewInputSchema))
    body: CreateReviewInput,
  ) {
    return this.createReview.execute(currentUser, body)
  }
}
