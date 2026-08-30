import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import {
  CancelBookingInputSchema,
  ConfirmBookingInputSchema,
  HoldSlotInputSchema,
  ListBookingsQuerySchema,
  type CancelBookingInput,
  type ConfirmBookingInput,
  type HoldSlotInput,
  type ListBookingsQuery,
} from '@lumira/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { CurrentUser } from '@/common/auth/current-user.decorator'
import { JwtGuard } from '@/common/auth/jwt.guard'
import { Roles } from '@/common/auth/roles.decorator'
import { RolesGuard } from '@/common/auth/roles.guard'
import { ZodValidationPipe } from '@/common/auth/zod-validation.pipe'
import { CancelClientBookingUseCase } from '@/modules/bookings/app/cancel-client-booking.usecase'
import { ConfirmBookingUseCase } from '@/modules/bookings/app/confirm-booking.usecase'
import { GetClientBookingUseCase } from '@/modules/bookings/app/get-client-booking.usecase'
import { HoldSlotUseCase } from '@/modules/bookings/app/hold-slot.usecase'
import { ListClientBookingsUseCase } from '@/modules/bookings/app/list-client-bookings.usecase'

@Controller('bookings')
@UseGuards(JwtGuard, RolesGuard)
@Roles('client')
export class ClientBookingsController {
  constructor(
    private readonly holdSlot: HoldSlotUseCase,
    private readonly confirmBooking: ConfirmBookingUseCase,
    private readonly listBookings: ListClientBookingsUseCase,
    private readonly getBooking: GetClientBookingUseCase,
    private readonly cancelBooking: CancelClientBookingUseCase,
  ) {}

  @Get()
  list(
    @CurrentUser() currentUser: AuthUser,
    @Query(new ZodValidationPipe(ListBookingsQuerySchema))
    query: ListBookingsQuery,
  ) {
    return this.listBookings.execute(currentUser, query)
  }

  @Get(':id')
  getOne(
    @CurrentUser() currentUser: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.getBooking.execute(currentUser, id)
  }

  @Post('holds')
  @HttpCode(201)
  createHold(
    @CurrentUser() currentUser: AuthUser,
    @Body(new ZodValidationPipe(HoldSlotInputSchema)) body: HoldSlotInput,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    return this.holdSlot.execute(currentUser, body, idempotencyKey ?? '')
  }

  @Post(':id/confirm')
  @HttpCode(200)
  confirm(
    @CurrentUser() currentUser: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(ConfirmBookingInputSchema))
    body: ConfirmBookingInput,
  ) {
    return this.confirmBooking.execute(currentUser, id, body)
  }

  @Post(':id/cancel')
  @HttpCode(200)
  cancel(
    @CurrentUser() currentUser: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(CancelBookingInputSchema))
    body: CancelBookingInput,
  ) {
    return this.cancelBooking.execute(currentUser, id, body)
  }
}
