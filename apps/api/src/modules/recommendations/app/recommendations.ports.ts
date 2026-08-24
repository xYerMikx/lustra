import type { CompletedClientBookingRow } from '@/modules/recommendations/domain/rank-service-recommendations'

export type ClientBookingStatsStore = {
  listCompletedByClient(userId: string): Promise<CompletedClientBookingRow[]>
}
