import type { SearchMastersQuery } from '@lumira/contracts'

import type { CatalogMasterRecord } from '@/modules/master-profile/domain/map-catalog-master'
import type { PublicMasterRecord } from '@/modules/master-profile/domain/map-public-master'

export type PublicMasterStore = {
  findPublicBySlug(slug: string): Promise<PublicMasterRecord | null>
  findPublishedById(id: string): Promise<CatalogMasterRecord | null>
  listPublishedByIds(ids: string[]): Promise<CatalogMasterRecord[]>
  searchPublished(query: SearchMastersQuery): Promise<CatalogMasterRecord[]>
}
