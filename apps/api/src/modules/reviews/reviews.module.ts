import { Module } from '@nestjs/common'

import { PrismaModule } from '@/common/prisma/prisma.module'
import { AuthModule } from '@/modules/auth/auth.module'
import { CatalogReviewsController } from '@/modules/reviews/api/catalog-reviews.controller'
import { ClientReviewsController } from '@/modules/reviews/api/client-reviews.controller'
import { MasterClientReviewsController } from '@/modules/reviews/api/master-client-reviews.controller'
import { MasterReviewsController } from '@/modules/reviews/api/master-reviews.controller'
import { ReviewsController } from '@/modules/reviews/api/reviews.controller'
import { CreateMasterClientReviewUseCase } from '@/modules/reviews/app/create-master-client-review.usecase'
import { CreateReviewUseCase } from '@/modules/reviews/app/create-review.usecase'
import { ListClientReviewsUseCase } from '@/modules/reviews/app/list-client-reviews.usecase'
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
    MasterClientReviewsController,
    ClientReviewsController,
  ],
  providers: [
    ReviewRepository,
    CreateReviewUseCase,
    CreateMasterClientReviewUseCase,
    ReplyToReviewUseCase,
    ListPublicReviewsUseCase,
    ListMasterReviewsUseCase,
    ListClientReviewsUseCase,
  ],
})
export class ReviewsModule {}
