import { Inject, Injectable } from '@nestjs/common'
import type { ServiceListResponse } from '@lustra/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import type { ServiceStore } from '@/modules/master-services/app/master-services.ports'
import { toServiceView } from '@/modules/master-services/domain/map-service'
import { ServiceRepository } from '@/modules/master-services/infra/service.repository'

@Injectable()
export class ListMasterServicesUseCase {
  constructor(
    @Inject(ServiceRepository)
    private readonly services: ServiceStore,
  ) {}

  async execute(actor: AuthUser): Promise<ServiceListResponse> {
    const masterId = await this.services.findMasterIdByUserId(actor.id)

    if (!masterId) {
      throw new DomainError('NOT_FOUND', 'Профиль мастера не найден')
    }

    const rows = await this.services.listByMasterId(masterId)

    return { services: rows.map(toServiceView) }
  }
}
