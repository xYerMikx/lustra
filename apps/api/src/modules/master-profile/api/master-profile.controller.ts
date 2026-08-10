import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common'
import {
  PatchMasterProfileInputSchema,
  type PatchMasterProfileInput,
} from '@lustra/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { CurrentUser } from '@/common/auth/current-user.decorator'
import { JwtGuard } from '@/common/auth/jwt.guard'
import { Roles } from '@/common/auth/roles.decorator'
import { RolesGuard } from '@/common/auth/roles.guard'
import { ZodValidationPipe } from '@/common/auth/zod-validation.pipe'
import { GetMasterProfileUseCase } from '@/modules/master-profile/app/get-master-profile.usecase'
import { UpdateMasterProfileUseCase } from '@/modules/master-profile/app/update-master-profile.usecase'

@Controller('master/profile')
@UseGuards(JwtGuard, RolesGuard)
@Roles('master')
export class MasterProfileController {
  constructor(
    private readonly getProfile: GetMasterProfileUseCase,
    private readonly updateProfile: UpdateMasterProfileUseCase,
  ) {}

  @Get()
  get(@CurrentUser() user: AuthUser) {
    return this.getProfile.execute(user)
  }

  @Patch()
  patch(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(PatchMasterProfileInputSchema)) body: PatchMasterProfileInput,
  ) {
    return this.updateProfile.execute(user, body)
  }
}
