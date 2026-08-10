import { Controller, Get } from '@nestjs/common'

import { ListDistrictsUseCase } from '@/modules/master-profile/app/list-districts.usecase'

@Controller('catalog/districts')
export class CatalogDistrictsController {
  constructor(private readonly listDistricts: ListDistrictsUseCase) {}

  @Get()
  list() {
    return this.listDistricts.execute()
  }
}
