import { Inject, Injectable } from '@nestjs/common'
import type {
  CreateLedgerEntryInput,
  LedgerEntryResponse,
} from '@lumira/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import { TransactionManager } from '@/common/prisma/transaction-manager.service'
import { ClockService } from '@/common/time/clock.service'
import type { LedgerStore } from '@/modules/master-ledger/app/master-ledger.ports'
import {
  ymdInMinsk,
  ymdToUtcDate,
} from '@/modules/master-ledger/domain/ledger-period'
import { toLedgerEntryView } from '@/modules/master-ledger/domain/map-ledger'
import { parseMoneyAmount } from '@/modules/master-ledger/domain/parse-money'
import { LedgerRepository } from '@/modules/master-ledger/infra/ledger.repository'

@Injectable()
export class CreateLedgerEntryUseCase {
  constructor(
    @Inject(LedgerRepository)
    private readonly ledger: LedgerStore,
    private readonly tx: TransactionManager,
    private readonly clock: ClockService,
  ) {}

  async execute(
    currentUser: AuthUser,
    input: CreateLedgerEntryInput,
  ): Promise<LedgerEntryResponse> {
    const masterId = await this.ledger.findMasterIdByUserId(currentUser.id)

    if (!masterId) {
      throw DomainError.notFound('Профиль мастера не найден')
    }

    const amount = parseMoneyAmount(input.amount)
    const now = this.clock.now()
    const occurredOn = input.occurredOn ?? ymdInMinsk(now)
    const periodStart =
      input.periodStart ?? (input.kind === 'expense' ? occurredOn : null)
    const periodEnd = input.periodEnd ?? periodStart

    const entry = await this.tx.run(async () => {
      const category = await this.ledger.findCategory(masterId, input.categoryId)

      if (!category) {
        throw DomainError.notFound('Категория не найдена')
      }

      if (category.kind !== input.kind) {
        throw DomainError.invalidState('Категория не подходит к типу записи')
      }

      if (input.bookingId) {
        const booking = await this.ledger.findOwnedBooking(
          masterId,
          input.bookingId,
        )

        if (!booking || booking.status !== 'completed') {
          throw DomainError.notFound('Завершённая запись не найдена')
        }
      }

      return this.ledger.createManualEntry({
        masterId,
        kind: input.kind,
        categoryId: category.id,
        amount,
        currency: 'BYN',
        occurredOn: ymdToUtcDate(occurredOn),
        occurredAt: now,
        periodStart: periodStart ? ymdToUtcDate(periodStart) : null,
        periodEnd: periodEnd ? ymdToUtcDate(periodEnd) : null,
        bookingId: input.bookingId ?? null,
        note: input.note?.trim() ? input.note.trim() : null,
      })
    })

    return { entry: toLedgerEntryView(entry) }
  }
}
