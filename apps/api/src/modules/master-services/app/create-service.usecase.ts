import { Inject, Injectable } from '@nestjs/common'
import type { CreateServiceInput, ServiceView } from '@lustra/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import type {
  CategoryStore,
  ServiceStore,
} from '@/modules/master-services/app/master-services.ports'
import {
  toPrismaDecimal,
  toServiceView,
  type ServiceWriteData,
} from '@/modules/master-services/domain/map-service'
import { assertDurationStep } from '@/modules/master-services/domain/service-rules'
import { CategoryRepository } from '@/modules/master-services/infra/category.repository'
import { ServiceRepository } from '@/modules/master-services/infra/service.repository'

@Injectable()
export class CreateServiceUseCase {
  constructor(
    @Inject(ServiceRepository)
    private readonly services: ServiceStore,
    @Inject(CategoryRepository)
    private readonly categories: CategoryStore,
  ) {}

  async execute(currentUser: AuthUser, input: CreateServiceInput): Promise<ServiceView> {
    const masterId = await this.services.findMasterIdByUserId(currentUser.id)

    if (!masterId) {
      throw new DomainError('NOT_FOUND', 'Профиль мастера не найден')
    }

    const category = await this.categories.findById(input.categoryId)

    if (!category) {
      throw new DomainError('VALIDATION_FAILED', 'Категория не найдена', {
        fieldErrors: { categoryId: ['Выберите категорию из списка'] },
      })
    }

    assertDurationStep(input.durationMin)

    const priceType = input.priceType ?? 'fixed'
    const data: ServiceWriteData = {
      categoryId: input.categoryId,
      title: input.title,
      description: input.description ?? null,
      durationMin: input.durationMin,
      bufferAfterMin: input.bufferAfterMin ?? 0,
      price: toPrismaDecimal(input.price),
      priceMax:
        priceType === 'range' && input.priceMax != null
          ? toPrismaDecimal(input.priceMax)
          : null,
      priceType,
      isActive: input.isActive ?? true,
    }

    const created = await this.services.create(masterId, data)

    return toServiceView(created)
  }
}
