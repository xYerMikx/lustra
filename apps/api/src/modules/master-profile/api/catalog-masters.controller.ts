import { Controller, Get, Param } from '@nestjs/common'

import { GetPublicMasterBySlugUseCase } from '@/modules/master-profile/app/get-public-master-by-slug.usecase'

@Controller('catalog/masters')
export class CatalogMastersController {
  constructor(private readonly getBySlug: GetPublicMasterBySlugUseCase) {}

  @Get(':slug')
  get(@Param('slug') slug: string) {
    return this.getBySlug.execute(slug)
  }
}
