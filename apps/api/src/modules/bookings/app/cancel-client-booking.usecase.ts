import { Inject, Injectable } from '@nestjs/common'
import type {
  CancelBookingInput,
  CancelBookingResponse,
} from '@lustra/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import { TransactionManager } from '@/common/prisma/transaction-manager.service'
import { ClockService } from '@/common/time/clock.service'
import type { BookingStore } from '@/modules/bookings/app/booking.ports'
import { resolveClientCancel } from '@/modules/bookings/domain/booking-status.machine'
import { toBookingClientView } from '@/modules/bookings/domain/map-booking'
import { BookingRepository } from '@/modules/bookings/infra/booking.repository'

@Injectable()
export class CancelClientBookingUseCase {
  constructor(
    @Inject(BookingRepository)
    private readonly bookings: BookingStore,
    private readonly tx: TransactionManager,
    private readonly clock: ClockService,
  ) {}

  async execute(
    currentUser: AuthUser,
    bookingId: string,
    input: CancelBookingInput,
  ): Promise<CancelBookingResponse> {
    const booking = await this.bookings.findBookingById(bookingId)

    if (!booking || booking.clientUserId !== currentUser.id) {
      throw DomainError.notFound('Бронь не найдена')
    }

    const policy = await this.bookings.getPolicy(booking.masterId)

    if (!policy) {
      throw DomainError.notFound('Политика бронирования не найдена')
    }

    const now = this.clock.now()
    const decision = resolveClientCancel({
      status: booking.status,
      startsAt: booking.startsAt,
      now,
      clientCancelCutoffMin: policy.clientCancelCutoffMin,
    })

    if (!decision.ok) {
      if (decision.reason === 'cutoff_passed') {
        throw DomainError.cancelCutoffPassed()
      }

      throw DomainError.invalidState('Бронь нельзя отменить в этом статусе')
    }

    const cancelled = await this.tx.run(async () => {
      return this.bookings.cancelBooking({
        bookingId,
        toStatus: decision.toStatus,
        cancelledByType: 'client',
        actorId: currentUser.id,
        reason: input.reason?.trim() ? input.reason.trim() : null,
        now,
      })
    })

    if (!cancelled) {
      throw DomainError.invalidState('Бронь уже изменена')
    }

    return { booking: toBookingClientView(cancelled) }
  }
}
