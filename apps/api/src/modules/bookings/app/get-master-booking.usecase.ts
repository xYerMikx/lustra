import { Inject, Injectable } from '@nestjs/common'
import type { MasterBookingResponse } from '@lustra/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import type { BookingStore } from '@/modules/bookings/app/booking.ports'
import { toBookingMasterView } from '@/modules/bookings/domain/map-booking'
import { BookingRepository } from '@/modules/bookings/infra/booking.repository'

@Injectable()
export class GetMasterBookingUseCase {
  constructor(
    @Inject(BookingRepository)
    private readonly bookings: BookingStore,
  ) {}

  async execute(
    currentUser: AuthUser,
    bookingId: string,
  ): Promise<MasterBookingResponse> {
    const masterId = await this.bookings.findMasterIdByUserId(currentUser.id)

    if (!masterId) {
      throw DomainError.notFound('Профиль мастера не найден')
    }

    const booking = await this.bookings.findBookingById(bookingId)

    if (!booking || booking.masterId !== masterId) {
      throw DomainError.notFound('Бронь не найдена')
    }

    return { booking: toBookingMasterView(booking) }
  }
}
