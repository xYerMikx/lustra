import { Module } from '@nestjs/common'

import { AdminGuard } from '@/common/auth/admin.guard'
import { AdminIpAllowlistGuard } from '@/common/auth/admin-ip-allowlist.guard'
import { PrismaModule } from '@/common/prisma/prisma.module'
import { AuthModule } from '@/modules/auth/auth.module'
import { AdminMastersController } from '@/modules/admin-moderation/api/admin-masters.controller'
import { AdminPortfolioController } from '@/modules/admin-moderation/api/admin-portfolio.controller'
import { AdminReviewsController } from '@/modules/admin-moderation/api/admin-reviews.controller'
import { ListAdminMastersUseCase } from '@/modules/admin-moderation/app/list-admin-masters.usecase'
import { ListAdminPortfolioUseCase } from '@/modules/admin-moderation/app/list-admin-portfolio.usecase'
import { ListAdminReviewsUseCase } from '@/modules/admin-moderation/app/list-admin-reviews.usecase'
import { ModerateMasterUseCase } from '@/modules/admin-moderation/app/moderate-master.usecase'
import { ModeratePortfolioUseCase } from '@/modules/admin-moderation/app/moderate-portfolio.usecase'
import { ModerateReviewUseCase } from '@/modules/admin-moderation/app/moderate-review.usecase'
import { AdminModerationRepository } from '@/modules/admin-moderation/infra/admin-moderation.repository'

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [
    AdminMastersController,
    AdminPortfolioController,
    AdminReviewsController,
  ],
  providers: [
    AdminGuard,
    AdminIpAllowlistGuard,
    AdminModerationRepository,
    ListAdminMastersUseCase,
    ModerateMasterUseCase,
    ListAdminPortfolioUseCase,
    ModeratePortfolioUseCase,
    ListAdminReviewsUseCase,
    ModerateReviewUseCase,
  ],
})
export class AdminModerationModule {}
