import type { AdminMasterCard } from '@lustra/contracts'

import type { AdminMasterRecord } from '@/modules/admin-moderation/infra/admin-moderation.repository'

export function toAdminMasterCard(record: AdminMasterRecord): AdminMasterCard {
  const primary = record.locations[0]

  return {
    id: record.id,
    slug: record.slug,
    displayName: record.displayName,
    status: record.status,
    districtName: primary?.district.name ?? null,
    updatedAt: record.updatedAt.toISOString(),
  }
}
