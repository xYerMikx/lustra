import type { RecommendedServiceView } from '@lustra/contracts'

export const DEFAULT_RECOMMENDATION_LIMIT = 3

export type CompletedClientBookingMaster = {
  id: string
  slug: string
  displayName: string
}

export type CompletedClientBookingRow = {
  serviceId: string | null
  serviceTitle: string
  categoryId: string | null
  completedAt: Date
  master: CompletedClientBookingMaster | null
}

type ServiceRecommendationGroup = {
  serviceId: string | null
  serviceTitle: string
  categoryId: string | null
  completedCount: number
  lastCompletedAt: Date
  lastMaster: CompletedClientBookingMaster | null
}

export function rankServiceRecommendations(
  rows: readonly CompletedClientBookingRow[],
  limit = DEFAULT_RECOMMENDATION_LIMIT,
): RecommendedServiceView[] {
  const groups = new Map<string, ServiceRecommendationGroup>()

  for (const row of rows) {
    const key = row.serviceId ?? row.serviceTitle
    const existing = groups.get(key)

    if (!existing) {
      groups.set(key, {
        serviceId: row.serviceId,
        serviceTitle: row.serviceTitle,
        categoryId: row.categoryId,
        completedCount: 1,
        lastCompletedAt: row.completedAt,
        lastMaster: row.master,
      })

      continue
    }

    existing.completedCount += 1

    if (row.completedAt > existing.lastCompletedAt) {
      existing.serviceId = row.serviceId
      existing.serviceTitle = row.serviceTitle
      existing.categoryId = row.categoryId
      existing.lastCompletedAt = row.completedAt
      existing.lastMaster = row.master
    }
  }

  return [...groups.values()]
    .sort(compareRecommendationGroups)
    .slice(0, limit)
    .map(toRecommendedServiceView)
}

function compareRecommendationGroups(
  left: ServiceRecommendationGroup,
  right: ServiceRecommendationGroup,
): number {
  if (right.completedCount !== left.completedCount) {
    return right.completedCount - left.completedCount
  }

  return right.lastCompletedAt.getTime() - left.lastCompletedAt.getTime()
}

export function toRecommendedServiceView(
  group: ServiceRecommendationGroup,
): RecommendedServiceView {
  return {
    serviceTitle: group.serviceTitle,
    serviceId: group.serviceId,
    categoryId: group.categoryId,
    completedCount: group.completedCount,
    lastCompletedAt: group.lastCompletedAt.toISOString(),
    lastMaster: group.lastMaster
      ? {
          id: group.lastMaster.id,
          slug: group.lastMaster.slug,
          displayName: group.lastMaster.displayName,
        }
      : null,
  }
}
