import { Inject, Injectable } from '@nestjs/common'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import type { LedgerStore } from '@/modules/master-ledger/app/master-ledger.ports'
import { LedgerRepository } from '@/modules/master-ledger/infra/ledger.repository'

@Injectable()
export class DeleteLedgerEntryUseCase {
  constructor(
    @Inject(LedgerRepository)
    private readonly ledger: LedgerStore,
  ) {}

  async execute(currentUser: AuthUser, entryId: string): Promise<void> {
    const masterId = await this.ledger.findMasterIdByUserId(currentUser.id)

    if (!masterId) {
      throw DomainError.notFound('Профиль мастера не найден')
    }

    const entry = await this.ledger.findEntry(masterId, entryId)

    if (!entry) {
      throw DomainError.notFound('Запись не найдена')
    }

    if (entry.source !== 'manual') {
      throw DomainError.invalidState('Доход из визита нельзя удалить')
    }

    const deleted = await this.ledger.deleteManualEntry(masterId, entryId)

    if (!deleted) {
      throw DomainError.invalidState('Запись уже изменена')
    }
  }
}
