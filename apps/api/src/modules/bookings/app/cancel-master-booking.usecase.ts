import { Inject, Injectable } from '@nestjs/common'
import type {
  MasterBookingResponse,
  MasterCancelBookingInput,
} from '@lustra/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import { TransactionManager } from '@/common/prisma/transaction-manager.service'
import { ClockService } from '@/common/time/clock.service'
import type { BookingStore } from '@/modules/bookings/app/booking.ports'
import { resolveMasterCancel } from '@/modules/bookings/domain/booking-status.machine'
import { toBookingMasterView } from '@/modules/bookings/domain/map-booking'
import { BookingRepository } from '@/modules/bookings/infra/booking.repository'

@Injectable()
export class CancelMasterBookingUseCase {
  constructor(
    @Inject(BookingRepository)
    private readonly bookings: BookingStore,
    private readonly tx: TransactionManager,
    private readonly clock: ClockService,
  ) {}

  async execute(
    currentUser: AuthUser,
    bookingId: string,
    input: MasterCancelBookingInput,
  ): Promise<MasterBookingResponse> {
    const masterId = await this.bookings.findMasterIdByUserId(currentUser.id)

    if (!masterId) {
      throw DomainError.notFound('Профиль мастера не найден')
    }

    const booking = await this.bookings.findBookingById(bookingId)

    if (!booking || booking.masterId !== masterId) {
      throw DomainError.notFound('Бронь не найдена')
    }

    const decision = resolveMasterCancel({ status: booking.status })

    if (!decision.ok) {
      throw DomainError.invalidState('Бронь нельзя отменить в этом статусе')
    }

    const cancelled = await this.tx.run(async () => {
      return this.bookings.cancelBooking({
        bookingId,
        toStatus: decision.toStatus,
        cancelledByType: 'master',
        actorId: currentUser.id,
        reason: input.reason.trim(),
        now: this.clock.now(),
      })
    })

    if (!cancelled) {
      throw DomainError.invalidState('Бронь уже изменена')
    }

    return { booking: toBookingMasterView(cancelled) }
  }
}
