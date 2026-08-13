import { Controller, Get, Param } from '@nestjs/common'

import { ListPublicReviewsUseCase } from '@/modules/reviews/app/list-public-reviews.usecase'

@Controller('catalog/masters')
export class CatalogReviewsController {
  constructor(private readonly listPublic: ListPublicReviewsUseCase) {}

  @Get(':slug/reviews')
  list(@Param('slug') slug: string) {
    return this.listPublic.execute(slug)
  }
}
