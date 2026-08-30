import { Inject, Injectable } from '@nestjs/common'
import type {
  SearchMastersQuery,
  SearchMastersResponse,
} from '@lumira/contracts'

import type { PublicMasterStore } from '@/modules/master-profile/app/public-master.ports'
import { toCatalogMasterCard } from '@/modules/master-profile/domain/map-catalog-master'
import { PublicMasterRepository } from '@/modules/master-profile/infra/public-master.repository'

@Injectable()
export class SearchMastersUseCase {
  constructor(
    @Inject(PublicMasterRepository)
    private readonly masters: PublicMasterStore,
  ) {}

  async execute(query: SearchMastersQuery): Promise<SearchMastersResponse> {
    const records = await this.masters.searchPublished(query)

    return {
      items: records.map(toCatalogMasterCard),
    }
  }
}
