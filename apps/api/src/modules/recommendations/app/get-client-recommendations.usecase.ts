import { Inject, Injectable } from '@nestjs/common'
import type { ClientRecommendationsResponse } from '@lustra/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import type { ClientBookingStatsStore } from '@/modules/recommendations/app/recommendations.ports'
import { rankServiceRecommendations } from '@/modules/recommendations/domain/rank-service-recommendations'
import { ClientBookingStatsRepository } from '@/modules/recommendations/infra/client-booking-stats.repository'

@Injectable()
export class GetClientRecommendationsUseCase {
  constructor(
    @Inject(ClientBookingStatsRepository)
    private readonly bookings: ClientBookingStatsStore,
  ) {}

  async execute(
    currentUser: AuthUser,
  ): Promise<ClientRecommendationsResponse> {
    const rows = await this.bookings.listCompletedByClient(currentUser.id)

    return {
      recommendations: rankServiceRecommendations(rows),
    }
  }
}
