import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import {
  CheckSlugAvailabilityQuerySchema,
  PatchMasterProfileInputSchema,
  type CheckSlugAvailabilityQuery,
  type PatchMasterProfileInput,
} from '@lustra/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { CurrentUser } from '@/common/auth/current-user.decorator'
import { JwtGuard } from '@/common/auth/jwt.guard'
import { Roles } from '@/common/auth/roles.decorator'
import { RolesGuard } from '@/common/auth/roles.guard'
import { ZodValidationPipe } from '@/common/auth/zod-validation.pipe'
import { CheckSlugAvailabilityUseCase } from '@/modules/master-profile/app/check-slug-availability.usecase'
import { GetMasterProfileUseCase } from '@/modules/master-profile/app/get-master-profile.usecase'
import { PublishMasterProfileUseCase } from '@/modules/master-profile/app/publish-master-profile.usecase'
import { UpdateMasterContactsUseCase } from '@/modules/master-profile/app/update-master-contacts.usecase'
import { UpdateMasterProfileUseCase } from '@/modules/master-profile/app/update-master-profile.usecase'

@Controller('master/profile')
@UseGuards(JwtGuard, RolesGuard)
@Roles('master')
export class MasterProfileController {
  constructor(
    private readonly getProfile: GetMasterProfileUseCase,
    private readonly updateProfile: UpdateMasterProfileUseCase,
    private readonly updateContacts: UpdateMasterContactsUseCase,
    private readonly checkSlugAvailability: CheckSlugAvailabilityUseCase,
    private readonly publishProfile: PublishMasterProfileUseCase,
  ) {}

  @Get()
  get(@CurrentUser() user: AuthUser) {
    return this.getProfile.execute(user)
  }

  @Get('slug-availability')
  checkSlug(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(CheckSlugAvailabilityQuerySchema))
    query: CheckSlugAvailabilityQuery,
  ) {
    return this.checkSlugAvailability.execute(user, query.slug)
  }

  @Patch()
  async patch(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(PatchMasterProfileInputSchema))
    body: PatchMasterProfileInput,
  ) {
    const contactInput = {
      publicPhone: body.publicPhone,
      instagram: body.instagram,
      telegramUsername: body.telegramUsername,
      website: body.website,
    }
    const hasContactPatch = Object.values(contactInput).some(
      (value) => value !== undefined,
    )
    const hasProfilePatch =
      body.displayName !== undefined ||
      body.slug !== undefined ||
      body.headline !== undefined ||
      body.bio !== undefined ||
      body.districtId !== undefined ||
      body.locationType !== undefined ||
      body.addressHint !== undefined

    if (hasContactPatch) {
      if (hasProfilePatch) {
        await this.updateProfile.execute(user, body)
      }

      return this.updateContacts.execute(user, contactInput)
    }

    return this.updateProfile.execute(user, body)
  }

  @Post('publish')
  publish(@CurrentUser() user: AuthUser) {
    return this.publishProfile.execute(user)
  }
}
