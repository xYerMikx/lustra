import {
  Body,
  Controller,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common'
import {
  CreateExtraSlotInputSchema,
  type CreateExtraSlotInput,
} from '@lustra/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { CurrentUser } from '@/common/auth/current-user.decorator'
import { JwtGuard } from '@/common/auth/jwt.guard'
import { Roles } from '@/common/auth/roles.decorator'
import { RolesGuard } from '@/common/auth/roles.guard'
import { ZodValidationPipe } from '@/common/auth/zod-validation.pipe'
import { CloseScheduleSlotUseCase } from '@/modules/master-schedule/app/close-schedule-slot.usecase'
import { CreateExtraSlotUseCase } from '@/modules/master-schedule/app/create-extra-slot.usecase'
import { ReopenScheduleSlotUseCase } from '@/modules/master-schedule/app/reopen-schedule-slot.usecase'

@Controller('master/schedule/slots')
@UseGuards(JwtGuard, RolesGuard)
@Roles('master')
export class MasterScheduleSlotsController {
  constructor(
    private readonly createExtra: CreateExtraSlotUseCase,
    private readonly closeSlot: CloseScheduleSlotUseCase,
    private readonly reopenSlot: ReopenScheduleSlotUseCase,
  ) {}

  @Post('extra')
  extra(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(CreateExtraSlotInputSchema))
    body: CreateExtraSlotInput,
  ) {
    return this.createExtra.execute(user, body)
  }

  @Post(':id/close')
  @HttpCode(204)
  async close(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    await this.closeSlot.execute(user, id)
  }

  @Post(':id/reopen')
  @HttpCode(204)
  async reopen(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    await this.reopenSlot.execute(user, id)
  }
}
