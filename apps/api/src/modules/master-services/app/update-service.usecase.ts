import { Inject, Injectable } from '@nestjs/common'
import type { ServiceView, UpdateServiceInput } from '@lustra/contracts'

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
export class UpdateServiceUseCase {
  constructor(
    @Inject(ServiceRepository)
    private readonly services: ServiceStore,
    @Inject(CategoryRepository)
    private readonly categories: CategoryStore,
  ) {}

  async execute(
    actor: AuthUser,
    serviceId: string,
    input: UpdateServiceInput,
  ): Promise<ServiceView> {
    const masterId = await this.services.findMasterIdByUserId(actor.id)

    if (!masterId) {
      throw new DomainError('NOT_FOUND', 'Профиль мастера не найден')
    }

    const existing = await this.services.findById(serviceId)

    if (!existing || existing.masterId !== masterId) {
      throw new DomainError('NOT_FOUND', 'Услуга не найдена')
    }

    if (input.categoryId) {
      const category = await this.categories.findById(input.categoryId)

      if (!category) {
        throw new DomainError('VALIDATION_FAILED', 'Категория не найдена', {
          fieldErrors: { categoryId: ['Выберите категорию из списка'] },
        })
      }
    }

    if (input.durationMin !== undefined) {
      assertDurationStep(input.durationMin)
    }

    const priceType = input.priceType ?? existing.priceType
    const patch: Partial<ServiceWriteData> = {}

    if (input.categoryId !== undefined) {
      patch.categoryId = input.categoryId
    }

    if (input.title !== undefined) {
      patch.title = input.title
    }

    if (input.description !== undefined) {
      patch.description = input.description
    }

    if (input.durationMin !== undefined) {
      patch.durationMin = input.durationMin
    }

    if (input.bufferAfterMin !== undefined) {
      patch.bufferAfterMin = input.bufferAfterMin
    }

    if (input.price !== undefined) {
      patch.price = toPrismaDecimal(input.price)
    }

    if (input.priceType !== undefined) {
      patch.priceType = input.priceType
    }

    if (input.isActive !== undefined) {
      patch.isActive = input.isActive
    }

    if (input.priceMax !== undefined || input.priceType !== undefined) {
      if (priceType !== 'range') {
        patch.priceMax = null
      } else if (input.priceMax != null) {
        patch.priceMax = toPrismaDecimal(input.priceMax)
      } else if (existing.priceMax) {
        patch.priceMax = toPrismaDecimal(Number(existing.priceMax))
      } else {
        patch.priceMax = null
      }
    }

    const updated = await this.services.update(serviceId, masterId, patch)

    return toServiceView(updated)
  }
}
