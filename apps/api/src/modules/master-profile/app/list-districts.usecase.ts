import { Injectable } from '@nestjs/common'
import type { DistrictView } from '@lustra/contracts'

import { DistrictRepository } from '../infra/district.repository'

@Injectable()
export class ListDistrictsUseCase {
  constructor(private readonly districts: DistrictRepository) {}

  async execute(): Promise<{ districts: DistrictView[] }> {
    const rows = await this.districts.listAll()
    return { districts: rows }
  }
}
