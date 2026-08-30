import { Injectable } from '@nestjs/common'
import type { PortfolioListResponse } from '@lumira/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import { toPortfolioItemView } from '@/modules/master-portfolio/domain/map-portfolio-item'
import { PortfolioRepository } from '@/modules/master-portfolio/infra/portfolio.repository'

@Injectable()
export class ListPortfolioUseCase {
  constructor(private readonly portfolio: PortfolioRepository) {}

  async execute(currentUser: AuthUser): Promise<PortfolioListResponse> {
    if (currentUser.role !== 'master') {
      throw new DomainError('FORBIDDEN', 'Недостаточно прав')
    }

    const masterId = await this.portfolio.findMasterIdByUserId(currentUser.id)

    if (!masterId) {
      throw new DomainError('NOT_FOUND', 'Профиль мастера не найден')
    }

    const items = await this.portfolio.listActive(masterId)

    return { items: items.map(toPortfolioItemView) }
  }
}
