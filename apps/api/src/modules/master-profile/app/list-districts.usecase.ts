import { Inject, Injectable } from '@nestjs/common'
import type { DistrictView } from '@lumira/contracts'

import type { DistrictStore } from '@/modules/master-profile/app/master-profile.ports'
import { DistrictRepository } from '@/modules/master-profile/infra/district.repository'

@Injectable()
export class ListDistrictsUseCase {
  constructor(
    @Inject(DistrictRepository)
    private readonly districts: DistrictStore,
  ) {}

  async execute(): Promise<{ districts: DistrictView[] }> {
    const rows = await this.districts.listAll()

    return { districts: rows }
  }
}
