import { Controller, Get, Query } from '@nestjs/common'

import { ListCategoriesUseCase } from '@/modules/master-services/app/list-categories.usecase'
import { ListServiceTemplatesUseCase } from '@/modules/master-services/app/list-service-templates.usecase'

@Controller('catalog')
export class CatalogServicesController {
  constructor(
    private readonly listCategories: ListCategoriesUseCase,
    private readonly listTemplates: ListServiceTemplatesUseCase,
  ) {}

  @Get('categories')
  categories() {
    return this.listCategories.execute()
  }

  @Get('service-templates')
  templates(@Query('categorySlug') categorySlug?: string) {
    return this.listTemplates.execute(categorySlug)
  }
}
