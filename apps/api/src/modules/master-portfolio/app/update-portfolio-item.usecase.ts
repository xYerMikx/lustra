import { Injectable } from '@nestjs/common'
import type {
  PatchPortfolioItemInput,
  PortfolioItemView,
} from '@lustra/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import { toPortfolioItemView } from '@/modules/master-portfolio/domain/map-portfolio-item'
import { PortfolioRepository } from '@/modules/master-portfolio/infra/portfolio.repository'

@Injectable()
export class UpdatePortfolioItemUseCase {
  constructor(private readonly portfolio: PortfolioRepository) {}

  async execute(
    actor: AuthUser,
    itemId: string,
    input: PatchPortfolioItemInput,
  ): Promise<PortfolioItemView> {
    if (actor.role !== 'master') {
      throw new DomainError('FORBIDDEN', 'Недостаточно прав')
    }

    const masterId = await this.portfolio.findMasterIdByUserId(actor.id)

    if (!masterId) {
      throw new DomainError('NOT_FOUND', 'Профиль мастера не найден')
    }

    const current = await this.portfolio.findActiveForMaster(masterId, itemId)

    if (!current) {
      throw new DomainError('NOT_FOUND', 'Фото не найдено')
    }

    if (input.serviceId) {
      const owned = await this.portfolio.serviceBelongsToMaster(
        masterId,
        input.serviceId,
      )

      if (!owned) {
        throw new DomainError('VALIDATION_FAILED', 'Услуга не найдена', {
          fieldErrors: { serviceId: ['Выберите свою услугу'] },
        })
      }
    }

    const updated = await this.portfolio.updateItem(masterId, itemId, input)

    return toPortfolioItemView(updated)
  }
}
