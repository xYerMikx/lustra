import { Inject, Injectable } from '@nestjs/common'
import type { PublicMasterView } from '@lustra/contracts'

import { DomainError } from '@/common/errors/domain-error'
import type { PublicMasterStore } from '@/modules/master-profile/app/public-master.ports'
import { toPublicMasterView } from '@/modules/master-profile/domain/map-public-master'
import { PublicMasterRepository } from '@/modules/master-profile/infra/public-master.repository'

@Injectable()
export class GetPublicMasterBySlugUseCase {
  constructor(
    @Inject(PublicMasterRepository)
    private readonly masters: PublicMasterStore,
  ) {}

  async execute(slug: string): Promise<PublicMasterView> {
    const record = await this.masters.findPublicBySlug(slug)

    if (!record) {
      throw new DomainError('NOT_FOUND', 'Мастер не найден')
    }

    return toPublicMasterView(record)
  }
}
