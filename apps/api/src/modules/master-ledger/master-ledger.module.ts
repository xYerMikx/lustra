import { Module } from '@nestjs/common'

import { PrismaModule } from '@/common/prisma/prisma.module'
import { AuthModule } from '@/modules/auth/auth.module'
import { MasterLedgerController } from '@/modules/master-ledger/api/master-ledger.controller'
import { CreateLedgerCategoryUseCase } from '@/modules/master-ledger/app/create-ledger-category.usecase'
import { CreateLedgerEntryUseCase } from '@/modules/master-ledger/app/create-ledger-entry.usecase'
import { DeleteLedgerEntryUseCase } from '@/modules/master-ledger/app/delete-ledger-entry.usecase'
import { ListLedgerUseCase } from '@/modules/master-ledger/app/list-ledger.usecase'
import { LedgerRepository } from '@/modules/master-ledger/infra/ledger.repository'

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [MasterLedgerController],
  providers: [
    LedgerRepository,
    ListLedgerUseCase,
    CreateLedgerEntryUseCase,
    CreateLedgerCategoryUseCase,
    DeleteLedgerEntryUseCase,
  ],
})
export class MasterLedgerModule {}
