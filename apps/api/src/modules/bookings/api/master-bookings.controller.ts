import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import {
  CreateManualBookingInputSchema,
  MasterCancelBookingInputSchema,
  MasterListBookingsQuerySchema,
  type CreateManualBookingInput,
  type MasterCancelBookingInput,
  type MasterListBookingsQuery,
} from '@lustra/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { CurrentUser } from '@/common/auth/current-user.decorator'
import { JwtGuard } from '@/common/auth/jwt.guard'
import { Roles } from '@/common/auth/roles.decorator'
import { RolesGuard } from '@/common/auth/roles.guard'
import { ZodValidationPipe } from '@/common/auth/zod-validation.pipe'
import { CancelMasterBookingUseCase } from '@/modules/bookings/app/cancel-master-booking.usecase'
import { CompleteBookingUseCase } from '@/modules/bookings/app/complete-booking.usecase'
import { ConfirmMasterBookingUseCase } from '@/modules/bookings/app/confirm-master-booking.usecase'
import { CreateManualBookingUseCase } from '@/modules/bookings/app/create-manual-booking.usecase'
import { GetMasterBookingUseCase } from '@/modules/bookings/app/get-master-booking.usecase'
import { ListMasterBookingsUseCase } from '@/modules/bookings/app/list-master-bookings.usecase'

@Controller('master/bookings')
@UseGuards(JwtGuard, RolesGuard)
@Roles('master')
export class MasterBookingsController {
  constructor(
    private readonly listBookings: ListMasterBookingsUseCase,
    private readonly getBooking: GetMasterBookingUseCase,
    private readonly createManual: CreateManualBookingUseCase,
    private readonly confirmBooking: ConfirmMasterBookingUseCase,
    private readonly completeBooking: CompleteBookingUseCase,
    private readonly cancelBooking: CancelMasterBookingUseCase,
  ) {}

  @Get()
  list(
    @CurrentUser() currentUser: AuthUser,
    @Query(new ZodValidationPipe(MasterListBookingsQuerySchema))
    query: MasterListBookingsQuery,
  ) {
    return this.listBookings.execute(currentUser, query)
  }

  @Post()
  @HttpCode(201)
  create(
    @CurrentUser() currentUser: AuthUser,
    @Body(new ZodValidationPipe(CreateManualBookingInputSchema))
    body: CreateManualBookingInput,
  ) {
    return this.createManual.execute(currentUser, body)
  }

  @Get(':id')
  getOne(
    @CurrentUser() currentUser: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.getBooking.execute(currentUser, id)
  }

  @Post(':id/confirm')
  @HttpCode(200)
  confirm(
    @CurrentUser() currentUser: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.confirmBooking.execute(currentUser, id)
  }

  @Post(':id/complete')
  @HttpCode(200)
  complete(
    @CurrentUser() currentUser: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.completeBooking.execute(currentUser, id)
  }

  @Post(':id/cancel')
  @HttpCode(200)
  cancel(
    @CurrentUser() currentUser: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(MasterCancelBookingInputSchema))
    body: MasterCancelBookingInput,
  ) {
    return this.cancelBooking.execute(currentUser, id, body)
  }
}
