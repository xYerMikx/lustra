import { Inject, Injectable } from '@nestjs/common'
import type {
  BookingListResponse,
  ListBookingsQuery,
} from '@lustra/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { ClockService } from '@/common/time/clock.service'
import type { BookingStore } from '@/modules/bookings/app/booking.ports'
import { toBookingClientView } from '@/modules/bookings/domain/map-booking'
import { BookingRepository } from '@/modules/bookings/infra/booking.repository'

@Injectable()
export class ListClientBookingsUseCase {
  constructor(
    @Inject(BookingRepository)
    private readonly bookings: BookingStore,
    private readonly clock: ClockService,
  ) {}

  async execute(
    currentUser: AuthUser,
    query: ListBookingsQuery,
  ): Promise<BookingListResponse> {
    const items = await this.bookings.listBookingsForClient({
      clientUserId: currentUser.id,
      scope: query.scope,
      now: this.clock.now(),
    })

    return { items: items.map(toBookingClientView) }
  }
}
