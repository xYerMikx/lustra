import { Module } from '@nestjs/common'

import { PrismaModule } from '@/common/prisma/prisma.module'
import { AuthModule } from '@/modules/auth/auth.module'
import { CatalogReviewsController } from '@/modules/reviews/api/catalog-reviews.controller'
import { MasterReviewsController } from '@/modules/reviews/api/master-reviews.controller'
import { ReviewsController } from '@/modules/reviews/api/reviews.controller'
import { CreateReviewUseCase } from '@/modules/reviews/app/create-review.usecase'
import { ListMasterReviewsUseCase } from '@/modules/reviews/app/list-master-reviews.usecase'
import { ListPublicReviewsUseCase } from '@/modules/reviews/app/list-public-reviews.usecase'
import { ReplyToReviewUseCase } from '@/modules/reviews/app/reply-to-review.usecase'
import { ReviewRepository } from '@/modules/reviews/infra/review.repository'

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [
    ReviewsController,
    CatalogReviewsController,
    MasterReviewsController,
  ],
  providers: [
    ReviewRepository,
    CreateReviewUseCase,
    ReplyToReviewUseCase,
    ListPublicReviewsUseCase,
    ListMasterReviewsUseCase,
  ],
})
export class ReviewsModule {}
