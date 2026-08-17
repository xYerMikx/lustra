import type { AdminPortfolioCard, AdminReviewCard } from '@lustra/contracts'

import { publicMediaUrl } from '@/common/media/public-media-url'
import type {
  AdminPortfolioRecord,
  AdminReviewRecord,
} from '@/modules/admin-moderation/infra/admin-moderation.repository'

export function toAdminPortfolioCard(
  record: AdminPortfolioRecord,
): AdminPortfolioCard {
  return {
    id: record.id,
    url: publicMediaUrl(record.media.storageKey),
    caption: record.caption,
    moderation: record.media.moderation,
    masterId: record.master.id,
    masterSlug: record.master.slug,
    masterDisplayName: record.master.displayName,
    createdAt: record.createdAt.toISOString(),
  }
}

export function toAdminReviewCard(record: AdminReviewRecord): AdminReviewCard {
  const firstName = record.client.firstName.trim()

  return {
    id: record.id,
    rating: record.rating,
    text: record.text,
    status: record.status,
    masterId: record.masterId,
    masterSlug: record.master.slug,
    masterDisplayName: record.master.displayName,
    clientFirstName: firstName.length > 0 ? firstName : 'Клиент',
    createdAt: record.createdAt.toISOString(),
  }
}
