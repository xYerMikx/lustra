import type { PortfolioItemView } from '@lustra/contracts'

import { publicMediaUrl } from '@/common/media/public-media-url'
import type { PortfolioItemRecord } from '@/modules/master-portfolio/infra/portfolio.repository'

export function toPortfolioItemView(record: PortfolioItemRecord): PortfolioItemView {
  return {
    id: record.id,
    url: publicMediaUrl(record.media.storageKey),
    width: record.media.width,
    height: record.media.height,
    caption: record.caption,
    serviceId: record.serviceId,
    sort: record.sort,
    isCover: record.isCover,
  }
}
