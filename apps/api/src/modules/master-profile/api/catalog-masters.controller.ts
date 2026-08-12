import { Controller, Get, Param, Query } from '@nestjs/common'
import {
  SearchMastersQuerySchema,
  type SearchMastersQuery,
} from '@lustra/contracts'

import { ZodValidationPipe } from '@/common/auth/zod-validation.pipe'
import { GetPublicMasterBySlugUseCase } from '@/modules/master-profile/app/get-public-master-by-slug.usecase'
import { SearchMastersUseCase } from '@/modules/master-profile/app/search-masters.usecase'

@Controller('catalog/masters')
export class CatalogMastersController {
  constructor(
    private readonly searchMasters: SearchMastersUseCase,
    private readonly getBySlug: GetPublicMasterBySlugUseCase,
  ) {}

  @Get()
  search(
    @Query(new ZodValidationPipe(SearchMastersQuerySchema))
    query: SearchMastersQuery,
  ) {
    return this.searchMasters.execute(query)
  }

  @Get(':slug')
  get(@Param('slug') slug: string) {
    return this.getBySlug.execute(slug)
  }
}
