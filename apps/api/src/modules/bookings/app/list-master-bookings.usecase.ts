import { Inject, Injectable } from '@nestjs/common'
import type {
  MasterBookingListResponse,
  MasterListBookingsQuery,
} from '@lumira/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import { ClockService } from '@/common/time/clock.service'
import type { BookingStore } from '@/modules/bookings/app/booking.ports'
import { toBookingMasterView } from '@/modules/bookings/domain/map-booking'
import { BookingRepository } from '@/modules/bookings/infra/booking.repository'

@Injectable()
export class ListMasterBookingsUseCase {
  constructor(
    @Inject(BookingRepository)
    private readonly bookings: BookingStore,
    private readonly clock: ClockService,
  ) {}

  async execute(
    currentUser: AuthUser,
    query: MasterListBookingsQuery,
  ): Promise<MasterBookingListResponse> {
    const masterId = await this.bookings.findMasterIdByUserId(currentUser.id)

    if (!masterId) {
      throw DomainError.notFound('Профиль мастера не найден')
    }

    const items = await this.bookings.listBookingsForMaster({
      masterId,
      scope: query.scope,
      now: this.clock.now(),
    })

    return { items: items.map(toBookingMasterView) }
  }
}
