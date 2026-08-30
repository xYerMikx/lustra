import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common'
import {
  PutMasterScheduleInputSchema,
  type PutMasterScheduleInput,
} from '@lumira/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { CurrentUser } from '@/common/auth/current-user.decorator'
import { JwtGuard } from '@/common/auth/jwt.guard'
import { Roles } from '@/common/auth/roles.decorator'
import { RolesGuard } from '@/common/auth/roles.guard'
import { ZodValidationPipe } from '@/common/auth/zod-validation.pipe'
import { GetMasterScheduleUseCase } from '@/modules/master-schedule/app/get-master-schedule.usecase'
import { PutMasterScheduleUseCase } from '@/modules/master-schedule/app/put-master-schedule.usecase'

@Controller('master/schedule')
@UseGuards(JwtGuard, RolesGuard)
@Roles('master')
export class MasterScheduleController {
  constructor(
    private readonly getSchedule: GetMasterScheduleUseCase,
    private readonly putSchedule: PutMasterScheduleUseCase,
  ) {}

  @Get()
  get(@CurrentUser() user: AuthUser) {
    return this.getSchedule.execute(user)
  }

  @Put('rules')
  putRules(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(PutMasterScheduleInputSchema))
    body: PutMasterScheduleInput,
  ) {
    return this.putSchedule.execute(user, body)
  }
}
