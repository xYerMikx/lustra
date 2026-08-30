import { Inject, Injectable } from '@nestjs/common'
import type {
  CreateLedgerCategoryInput,
  LedgerCategoryResponse,
} from '@lumira/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import type { LedgerStore } from '@/modules/master-ledger/app/master-ledger.ports'
import { toLedgerCategoryView } from '@/modules/master-ledger/domain/map-ledger'
import { slugifyCategoryName } from '@/modules/master-ledger/domain/system-categories'
import { LedgerRepository } from '@/modules/master-ledger/infra/ledger.repository'

@Injectable()
export class CreateLedgerCategoryUseCase {
  constructor(
    @Inject(LedgerRepository)
    private readonly ledger: LedgerStore,
  ) {}

  async execute(
    currentUser: AuthUser,
    input: CreateLedgerCategoryInput,
  ): Promise<LedgerCategoryResponse> {
    const masterId = await this.ledger.findMasterIdByUserId(currentUser.id)

    if (!masterId) {
      throw DomainError.notFound('Профиль мастера не найден')
    }

    const slug = slugifyCategoryName(input.name)

    if (!slug) {
      throw DomainError.invalidState('Укажите название категории')
    }

    await this.ledger.ensureSystemCategories(masterId)

    const category = await this.ledger.createCategory({
      masterId,
      kind: input.kind,
      name: input.name.trim(),
      slug,
    })

    return { category: toLedgerCategoryView(category) }
  }
}
