import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common'
import {
  CreateTimeBlockInputSchema,
  type CreateTimeBlockInput,
} from '@lumira/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { CurrentUser } from '@/common/auth/current-user.decorator'
import { JwtGuard } from '@/common/auth/jwt.guard'
import { Roles } from '@/common/auth/roles.decorator'
import { RolesGuard } from '@/common/auth/roles.guard'
import { ZodValidationPipe } from '@/common/auth/zod-validation.pipe'
import { CreateTimeBlockUseCase } from '@/modules/master-schedule/app/create-time-block.usecase'
import { DeleteTimeBlockUseCase } from '@/modules/master-schedule/app/delete-time-block.usecase'

@Controller('master/schedule/blocks')
@UseGuards(JwtGuard, RolesGuard)
@Roles('master')
export class MasterScheduleBlocksController {
  constructor(
    private readonly createBlock: CreateTimeBlockUseCase,
    private readonly deleteBlock: DeleteTimeBlockUseCase,
  ) {}

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(CreateTimeBlockInputSchema))
    body: CreateTimeBlockInput,
  ) {
    return this.createBlock.execute(user, body)
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.deleteBlock.execute(user, id)
  }
}
