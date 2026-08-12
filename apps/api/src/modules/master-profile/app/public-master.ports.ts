import type { SearchMastersQuery } from '@lustra/contracts'

import type { CatalogMasterRecord } from '@/modules/master-profile/domain/map-catalog-master'
import type { PublicMasterRecord } from '@/modules/master-profile/domain/map-public-master'

export type PublicMasterStore = {
  findPublicBySlug(slug: string): Promise<PublicMasterRecord | null>
  searchPublished(query: SearchMastersQuery): Promise<CatalogMasterRecord[]>
}
