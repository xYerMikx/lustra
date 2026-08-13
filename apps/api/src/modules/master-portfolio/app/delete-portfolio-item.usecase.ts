import { Injectable } from '@nestjs/common'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import { TransactionManager } from '@/common/prisma/transaction-manager.service'
import { PortfolioRepository } from '@/modules/master-portfolio/infra/portfolio.repository'

@Injectable()
export class DeletePortfolioItemUseCase {
  constructor(
    private readonly portfolio: PortfolioRepository,
    private readonly tx: TransactionManager,
  ) {}

  async execute(actor: AuthUser, itemId: string): Promise<void> {
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

    await this.tx.run(() => this.portfolio.softDelete(masterId, current))
  }
}
