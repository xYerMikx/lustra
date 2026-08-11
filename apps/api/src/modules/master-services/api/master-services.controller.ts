import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import {
  CreateServiceInputSchema,
  UpdateServiceInputSchema,
  type CreateServiceInput,
  type UpdateServiceInput,
} from '@lustra/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { CurrentUser } from '@/common/auth/current-user.decorator'
import { JwtGuard } from '@/common/auth/jwt.guard'
import { Roles } from '@/common/auth/roles.decorator'
import { RolesGuard } from '@/common/auth/roles.guard'
import { ZodValidationPipe } from '@/common/auth/zod-validation.pipe'
import { CreateServiceUseCase } from '@/modules/master-services/app/create-service.usecase'
import { ListMasterServicesUseCase } from '@/modules/master-services/app/list-master-services.usecase'
import { UpdateServiceUseCase } from '@/modules/master-services/app/update-service.usecase'

@Controller('master/services')
@UseGuards(JwtGuard, RolesGuard)
@Roles('master')
export class MasterServicesController {
  constructor(
    private readonly listServices: ListMasterServicesUseCase,
    private readonly createService: CreateServiceUseCase,
    private readonly updateService: UpdateServiceUseCase,
  ) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.listServices.execute(user)
  }

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(CreateServiceInputSchema)) body: CreateServiceInput,
  ) {
    return this.createService.execute(user, body)
  }

  @Patch(':id')
  patch(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(UpdateServiceInputSchema)) body: UpdateServiceInput,
  ) {
    return this.updateService.execute(user, id, body)
  }
}
