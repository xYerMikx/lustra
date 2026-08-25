import { Module } from '@nestjs/common'

import { PrismaModule } from '@/common/prisma/prisma.module'
import { AuthModule } from '@/modules/auth/auth.module'
import { ClientRecommendationsController } from '@/modules/recommendations/api/client-recommendations.controller'
import { GetClientRecommendationsUseCase } from '@/modules/recommendations/app/get-client-recommendations.usecase'
import { ClientBookingStatsRepository } from '@/modules/recommendations/infra/client-booking-stats.repository'

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ClientRecommendationsController],
  providers: [ClientBookingStatsRepository, GetClientRecommendationsUseCase],
})
export class RecommendationsModule {}
