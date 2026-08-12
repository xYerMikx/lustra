import type { PublicMasterRecord } from '@/modules/master-profile/domain/map-public-master'

export type PublicMasterStore = {
  findPublicBySlug(slug: string): Promise<PublicMasterRecord | null>
}
