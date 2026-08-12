import type { ServiceCategoryView } from '@lustra/contracts'

import type {
  ServiceRecord,
  ServiceWriteData,
} from '@/modules/master-services/domain/map-service'

export type ServiceStore = {
  findMasterIdByUserId(userId: string): Promise<string | null>
  listByMasterId(masterId: string): Promise<ServiceRecord[]>
  findById(id: string): Promise<ServiceRecord | null>
  create(masterId: string, data: ServiceWriteData): Promise<ServiceRecord>
  update(
    serviceId: string,
    masterId: string,
    data: Partial<ServiceWriteData>,
  ): Promise<ServiceRecord>
}

export type CategoryStore = {
  listAll(): Promise<ServiceCategoryView[]>
  findById(id: string): Promise<{ id: string; slug: string } | null>
  findBySlug(slug: string): Promise<ServiceCategoryView | null>
}
