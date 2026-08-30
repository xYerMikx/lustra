import { Inject, Injectable } from '@nestjs/common'
import type { ServiceCategoryListResponse } from '@lumira/contracts'

import type { CategoryStore } from '@/modules/master-services/app/master-services.ports'
import { CategoryRepository } from '@/modules/master-services/infra/category.repository'

@Injectable()
export class ListCategoriesUseCase {
  constructor(
    @Inject(CategoryRepository)
    private readonly categories: CategoryStore,
  ) {}

  async execute(): Promise<ServiceCategoryListResponse> {
    const categories = await this.categories.listAll()

    return { categories }
  }
}
