import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import {
  CreateLedgerCategoryInputSchema,
  CreateLedgerEntryInputSchema,
  ListLedgerQuerySchema,
  type CreateLedgerCategoryInput,
  type CreateLedgerEntryInput,
  type ListLedgerQuery,
} from '@lumira/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { CurrentUser } from '@/common/auth/current-user.decorator'
import { JwtGuard } from '@/common/auth/jwt.guard'
import { Roles } from '@/common/auth/roles.decorator'
import { RolesGuard } from '@/common/auth/roles.guard'
import { ZodValidationPipe } from '@/common/auth/zod-validation.pipe'
import { CreateLedgerCategoryUseCase } from '@/modules/master-ledger/app/create-ledger-category.usecase'
import { CreateLedgerEntryUseCase } from '@/modules/master-ledger/app/create-ledger-entry.usecase'
import { DeleteLedgerEntryUseCase } from '@/modules/master-ledger/app/delete-ledger-entry.usecase'
import { ListLedgerUseCase } from '@/modules/master-ledger/app/list-ledger.usecase'

@Controller('master/ledger')
@UseGuards(JwtGuard, RolesGuard)
@Roles('master')
export class MasterLedgerController {
  constructor(
    private readonly listLedger: ListLedgerUseCase,
    private readonly createEntry: CreateLedgerEntryUseCase,
    private readonly createCategory: CreateLedgerCategoryUseCase,
    private readonly deleteEntry: DeleteLedgerEntryUseCase,
  ) {}

  @Get()
  list(
    @CurrentUser() currentUser: AuthUser,
    @Query(new ZodValidationPipe(ListLedgerQuerySchema)) query: ListLedgerQuery,
  ) {
    return this.listLedger.execute(currentUser, query)
  }

  @Post('entries')
  createEntryRecord(
    @CurrentUser() currentUser: AuthUser,
    @Body(new ZodValidationPipe(CreateLedgerEntryInputSchema))
    body: CreateLedgerEntryInput,
  ) {
    return this.createEntry.execute(currentUser, body)
  }

  @Post('categories')
  createCategoryRecord(
    @CurrentUser() currentUser: AuthUser,
    @Body(new ZodValidationPipe(CreateLedgerCategoryInputSchema))
    body: CreateLedgerCategoryInput,
  ) {
    return this.createCategory.execute(currentUser, body)
  }

  @Delete('entries/:id')
  @HttpCode(204)
  removeEntry(
    @CurrentUser() currentUser: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.deleteEntry.execute(currentUser, id)
  }
}
