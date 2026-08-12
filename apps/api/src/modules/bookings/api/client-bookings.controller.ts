import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common'
import {
  ConfirmBookingInputSchema,
  HoldSlotInputSchema,
  type ConfirmBookingInput,
  type HoldSlotInput,
} from '@lustra/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { CurrentUser } from '@/common/auth/current-user.decorator'
import { JwtGuard } from '@/common/auth/jwt.guard'
import { Roles } from '@/common/auth/roles.decorator'
import { RolesGuard } from '@/common/auth/roles.guard'
import { ZodValidationPipe } from '@/common/auth/zod-validation.pipe'
import { ConfirmBookingUseCase } from '@/modules/bookings/app/confirm-booking.usecase'
import { HoldSlotUseCase } from '@/modules/bookings/app/hold-slot.usecase'

@Controller('bookings')
@UseGuards(JwtGuard, RolesGuard)
@Roles('client')
export class ClientBookingsController {
  constructor(
    private readonly holdSlot: HoldSlotUseCase,
    private readonly confirmBooking: ConfirmBookingUseCase,
  ) {}

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
}
