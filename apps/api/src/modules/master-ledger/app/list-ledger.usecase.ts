import { Inject, Injectable } from '@nestjs/common'
import type { LedgerListResponse, ListLedgerQuery } from '@lumira/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import { ClockService } from '@/common/time/clock.service'
import type { LedgerStore } from '@/modules/master-ledger/app/master-ledger.ports'
import {
  endOfYmdUtc,
  resolveLedgerRange,
  ymdToUtcDate,
} from '@/modules/master-ledger/domain/ledger-period'
import {
  toLedgerCategoryView,
  toLedgerEntryView,
} from '@/modules/master-ledger/domain/map-ledger'
import {
  subtractMoney,
  sumMoney,
} from '@/modules/master-ledger/domain/parse-money'
import { LedgerRepository } from '@/modules/master-ledger/infra/ledger.repository'

@Injectable()
export class ListLedgerUseCase {
  constructor(
    @Inject(LedgerRepository)
    private readonly ledger: LedgerStore,
    private readonly clock: ClockService,
  ) {}

  async execute(
    currentUser: AuthUser,
    query: ListLedgerQuery,
  ): Promise<LedgerListResponse> {
    const masterId = await this.ledger.findMasterIdByUserId(currentUser.id)

    if (!masterId) {
      throw DomainError.notFound('Профиль мастера не найден')
    }

    await this.ledger.ensureSystemCategories(masterId)
    await this.ledger.backfillBookingIncome(masterId)

    const range = resolveLedgerRange(this.clock.now(), {
      from: query.from,
      to: query.to,
    })
    const items = await this.ledger.listEntries({
      masterId,
      from: ymdToUtcDate(range.from),
      toExclusive: endOfYmdUtc(range.to),
      kind: query.kind,
      categoryId: query.categoryId,
    })
    const categories = await this.ledger.listCategories(masterId)
    const views = items.map(toLedgerEntryView)
    const incomeTotal = sumMoney(
      views.filter((item) => item.kind === 'income').map((item) => item.amount),
    )
    const expenseTotal = sumMoney(
      views.filter((item) => item.kind === 'expense').map((item) => item.amount),
    )

    return {
      from: range.from,
      to: range.to,
      summary: {
        incomeTotal,
        expenseTotal,
        netTotal: subtractMoney(incomeTotal, expenseTotal),
        currency: views[0]?.currency ?? 'BYN',
      },
      categories: categories.map(toLedgerCategoryView),
      items: views,
    }
  }
}
