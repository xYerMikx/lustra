import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import {
  MasterCalendarQuerySchema,
  type MasterCalendarQuery,
} from '@lustra/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { CurrentUser } from '@/common/auth/current-user.decorator'
import { JwtGuard } from '@/common/auth/jwt.guard'
import { Roles } from '@/common/auth/roles.decorator'
import { RolesGuard } from '@/common/auth/roles.guard'
import { ZodValidationPipe } from '@/common/auth/zod-validation.pipe'
import { GetMasterCalendarUseCase } from '@/modules/master-calendar/app/get-master-calendar.usecase'

@Controller('master/calendar')
@UseGuards(JwtGuard, RolesGuard)
@Roles('master')
export class MasterCalendarController {
  constructor(private readonly getCalendar: GetMasterCalendarUseCase) {}

  @Get()
  get(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(MasterCalendarQuerySchema))
    query: MasterCalendarQuery,
  ) {
    return this.getCalendar.execute(user, query)
  }
}
