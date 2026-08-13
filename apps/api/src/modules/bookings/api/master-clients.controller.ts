import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import {
  ListMasterClientsQuerySchema,
  type ListMasterClientsQuery,
} from '@lustra/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { CurrentUser } from '@/common/auth/current-user.decorator'
import { JwtGuard } from '@/common/auth/jwt.guard'
import { Roles } from '@/common/auth/roles.decorator'
import { RolesGuard } from '@/common/auth/roles.guard'
import { ZodValidationPipe } from '@/common/auth/zod-validation.pipe'
import { ListMasterClientsUseCase } from '@/modules/bookings/app/list-master-clients.usecase'

@Controller('master/clients')
@UseGuards(JwtGuard, RolesGuard)
@Roles('master')
export class MasterClientsController {
  constructor(private readonly listClients: ListMasterClientsUseCase) {}

  @Get()
  list(
    @CurrentUser() currentUser: AuthUser,
    @Query(new ZodValidationPipe(ListMasterClientsQuerySchema))
    query: ListMasterClientsQuery,
  ) {
    return this.listClients.execute(currentUser, query)
  }
}
