import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'
import {
  ListScheduleExceptionsQuerySchema,
  PutScheduleExceptionInputSchema,
  YmdDateSchema,
  type ListScheduleExceptionsQuery,
  type PutScheduleExceptionInput,
} from '@lustra/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { CurrentUser } from '@/common/auth/current-user.decorator'
import { JwtGuard } from '@/common/auth/jwt.guard'
import { Roles } from '@/common/auth/roles.decorator'
import { RolesGuard } from '@/common/auth/roles.guard'
import { ZodValidationPipe } from '@/common/auth/zod-validation.pipe'
import { DeleteScheduleExceptionUseCase } from '@/modules/master-schedule/app/delete-schedule-exception.usecase'
import { ListScheduleExceptionsUseCase } from '@/modules/master-schedule/app/list-schedule-exceptions.usecase'
import { PutScheduleExceptionUseCase } from '@/modules/master-schedule/app/put-schedule-exception.usecase'

@Controller('master/schedule/exceptions')
@UseGuards(JwtGuard, RolesGuard)
@Roles('master')
export class MasterScheduleExceptionsController {
  constructor(
    private readonly listExceptions: ListScheduleExceptionsUseCase,
    private readonly putException: PutScheduleExceptionUseCase,
    private readonly deleteException: DeleteScheduleExceptionUseCase,
  ) {}

  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(ListScheduleExceptionsQuerySchema))
    query: ListScheduleExceptionsQuery,
  ) {
    return this.listExceptions.execute(user, query)
  }

  @Put(':date')
  put(
    @CurrentUser() user: AuthUser,
    @Param('date', new ZodValidationPipe(YmdDateSchema)) date: string,
    @Body(new ZodValidationPipe(PutScheduleExceptionInputSchema))
    body: PutScheduleExceptionInput,
  ) {
    return this.putException.execute(user, date, body)
  }

  @Delete(':date')
  @HttpCode(204)
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('date', new ZodValidationPipe(YmdDateSchema)) date: string,
  ) {
    await this.deleteException.execute(user, date)
  }
}
