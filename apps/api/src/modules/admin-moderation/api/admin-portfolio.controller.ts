import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import {
  AdminListPortfolioQuerySchema,
  ModeratePortfolioInputSchema,
  type AdminListPortfolioQuery,
  type ModeratePortfolioInput,
} from '@lumira/contracts'
import type { FastifyRequest } from 'fastify'

import { AdminGuard } from '@/common/auth/admin.guard'
import { AdminIpAllowlistGuard } from '@/common/auth/admin-ip-allowlist.guard'
import type { AuthUser } from '@/common/auth/auth-user'
import { CurrentUser } from '@/common/auth/current-user.decorator'
import { JwtGuard } from '@/common/auth/jwt.guard'
import { Roles } from '@/common/auth/roles.decorator'
import { RolesGuard } from '@/common/auth/roles.guard'
import { ZodValidationPipe } from '@/common/auth/zod-validation.pipe'
import { ListAdminPortfolioUseCase } from '@/modules/admin-moderation/app/list-admin-portfolio.usecase'
import { ModeratePortfolioUseCase } from '@/modules/admin-moderation/app/moderate-portfolio.usecase'

@Controller('admin/portfolio')
@UseGuards(JwtGuard, AdminIpAllowlistGuard, AdminGuard, RolesGuard)
@Roles('admin')
export class AdminPortfolioController {
  constructor(
    private readonly listPortfolio: ListAdminPortfolioUseCase,
    private readonly moderatePortfolio: ModeratePortfolioUseCase,
  ) {}

  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(AdminListPortfolioQuerySchema))
    query: AdminListPortfolioQuery,
  ) {
    return this.listPortfolio.execute(user, query)
  }

  @Post(':id/moderate')
  moderate(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(ModeratePortfolioInputSchema))
    body: ModeratePortfolioInput,
    @Req() request: FastifyRequest,
  ) {
    return this.moderatePortfolio.execute(user, id, body, {
      ip: request.ip,
    })
  }
}
