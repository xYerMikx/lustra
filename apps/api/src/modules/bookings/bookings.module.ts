import { Module } from '@nestjs/common'

import { PrismaModule } from '@/common/prisma/prisma.module'
import { AuthModule } from '@/modules/auth/auth.module'
import { ClientBookingsController } from '@/modules/bookings/api/client-bookings.controller'
import { MasterBookingsController } from '@/modules/bookings/api/master-bookings.controller'
import { CancelClientBookingUseCase } from '@/modules/bookings/app/cancel-client-booking.usecase'
import { CancelMasterBookingUseCase } from '@/modules/bookings/app/cancel-master-booking.usecase'
import { ConfirmBookingUseCase } from '@/modules/bookings/app/confirm-booking.usecase'
import { ConfirmMasterBookingUseCase } from '@/modules/bookings/app/confirm-master-booking.usecase'
import { GetClientBookingUseCase } from '@/modules/bookings/app/get-client-booking.usecase'
import { GetMasterBookingUseCase } from '@/modules/bookings/app/get-master-booking.usecase'
import { HoldSlotUseCase } from '@/modules/bookings/app/hold-slot.usecase'
import { ListClientBookingsUseCase } from '@/modules/bookings/app/list-client-bookings.usecase'
import { ListMasterBookingsUseCase } from '@/modules/bookings/app/list-master-bookings.usecase'
import { BookingRepository } from '@/modules/bookings/infra/booking.repository'
import { SchedulingModule } from '@/modules/scheduling/scheduling.module'

@Module({
  imports: [PrismaModule, AuthModule, SchedulingModule],
  controllers: [ClientBookingsController, MasterBookingsController],
  providers: [
    BookingRepository,
    HoldSlotUseCase,
    ConfirmBookingUseCase,
    ListClientBookingsUseCase,
    GetClientBookingUseCase,
    CancelClientBookingUseCase,
    ListMasterBookingsUseCase,
    GetMasterBookingUseCase,
    ConfirmMasterBookingUseCase,
    CancelMasterBookingUseCase,
  ],
})
export class BookingsModule {}
