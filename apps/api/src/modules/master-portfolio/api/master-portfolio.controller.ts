import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import {
  CreatePortfolioQuerySchema,
  PatchPortfolioItemInputSchema,
  type CreatePortfolioQuery,
  type PatchPortfolioItemInput,
} from '@lustra/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { CurrentUser } from '@/common/auth/current-user.decorator'
import { JwtGuard } from '@/common/auth/jwt.guard'
import { Roles } from '@/common/auth/roles.decorator'
import { RolesGuard } from '@/common/auth/roles.guard'
import { ZodValidationPipe } from '@/common/auth/zod-validation.pipe'
import { RawBody } from '@/common/http/raw-body.decorator'
import { CreatePortfolioItemUseCase } from '@/modules/master-portfolio/app/create-portfolio-item.usecase'
import { DeletePortfolioItemUseCase } from '@/modules/master-portfolio/app/delete-portfolio-item.usecase'
import { ListPortfolioUseCase } from '@/modules/master-portfolio/app/list-portfolio.usecase'
import { UpdatePortfolioItemUseCase } from '@/modules/master-portfolio/app/update-portfolio-item.usecase'

@Controller('master/portfolio')
@UseGuards(JwtGuard, RolesGuard)
@Roles('master')
export class MasterPortfolioController {
  constructor(
    private readonly listPortfolio: ListPortfolioUseCase,
    private readonly createItem: CreatePortfolioItemUseCase,
    private readonly updateItem: UpdatePortfolioItemUseCase,
    private readonly deleteItem: DeletePortfolioItemUseCase,
  ) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.listPortfolio.execute(user)
  }

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @RawBody() bytes: Buffer,
    @Query(new ZodValidationPipe(CreatePortfolioQuerySchema))
    query: CreatePortfolioQuery,
  ) {
    return this.createItem.execute(user, bytes, query)
  }

  @Patch(':id')
  patch(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(PatchPortfolioItemInputSchema))
    body: PatchPortfolioItemInput,
  ) {
    return this.updateItem.execute(user, id, body)
  }

  @Delete(':id')
  @HttpCode(204)
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.deleteItem.execute(user, id)
  }
}
