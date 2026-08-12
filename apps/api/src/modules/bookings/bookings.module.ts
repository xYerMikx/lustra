import { Module } from '@nestjs/common'

import { PrismaModule } from '@/common/prisma/prisma.module'
import { AuthModule } from '@/modules/auth/auth.module'
import { ClientBookingsController } from '@/modules/bookings/api/client-bookings.controller'
import { ConfirmBookingUseCase } from '@/modules/bookings/app/confirm-booking.usecase'
import { HoldSlotUseCase } from '@/modules/bookings/app/hold-slot.usecase'
import { BookingRepository } from '@/modules/bookings/infra/booking.repository'
import { SchedulingModule } from '@/modules/scheduling/scheduling.module'

@Module({
  imports: [PrismaModule, AuthModule, SchedulingModule],
  controllers: [ClientBookingsController],
  providers: [BookingRepository, HoldSlotUseCase, ConfirmBookingUseCase],
})
export class BookingsModule {}
