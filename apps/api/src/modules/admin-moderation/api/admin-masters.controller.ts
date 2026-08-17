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
  AdminListMastersQuerySchema,
  ModerateMasterInputSchema,
  type AdminListMastersQuery,
  type ModerateMasterInput,
} from '@lustra/contracts'
import type { FastifyRequest } from 'fastify'

import { AdminGuard } from '@/common/auth/admin.guard'
import { AdminIpAllowlistGuard } from '@/common/auth/admin-ip-allowlist.guard'
import type { AuthUser } from '@/common/auth/auth-user'
import { CurrentUser } from '@/common/auth/current-user.decorator'
import { JwtGuard } from '@/common/auth/jwt.guard'
import { Roles } from '@/common/auth/roles.decorator'
import { RolesGuard } from '@/common/auth/roles.guard'
import { ZodValidationPipe } from '@/common/auth/zod-validation.pipe'
import { ListAdminMastersUseCase } from '@/modules/admin-moderation/app/list-admin-masters.usecase'
import { ModerateMasterUseCase } from '@/modules/admin-moderation/app/moderate-master.usecase'

@Controller('admin/masters')
@UseGuards(JwtGuard, AdminIpAllowlistGuard, AdminGuard, RolesGuard)
@Roles('admin')
export class AdminMastersController {
  constructor(
    private readonly listMasters: ListAdminMastersUseCase,
    private readonly moderateMaster: ModerateMasterUseCase,
  ) {}

  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(AdminListMastersQuerySchema))
    query: AdminListMastersQuery,
  ) {
    return this.listMasters.execute(user, query)
  }

  @Post(':id/moderate')
  moderate(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(ModerateMasterInputSchema))
    body: ModerateMasterInput,
    @Req() request: FastifyRequest,
  ) {
    return this.moderateMaster.execute(user, id, body, {
      ip: request.ip,
    })
  }
}
