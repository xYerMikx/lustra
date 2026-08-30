import { Inject, Injectable } from '@nestjs/common'
import type { ConfirmBookingResponse } from '@lumira/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import type { BookingStore } from '@/modules/bookings/app/booking.ports'
import { toBookingClientView } from '@/modules/bookings/domain/map-booking'
import { BookingRepository } from '@/modules/bookings/infra/booking.repository'

@Injectable()
export class GetClientBookingUseCase {
  constructor(
    @Inject(BookingRepository)
    private readonly bookings: BookingStore,
  ) {}

  async execute(
    currentUser: AuthUser,
    bookingId: string,
  ): Promise<ConfirmBookingResponse> {
    const booking = await this.bookings.findBookingById(bookingId)

    if (!booking || booking.clientUserId !== currentUser.id) {
      throw DomainError.notFound('Бронь не найдена')
    }

    return { booking: toBookingClientView(booking) }
  }
}
