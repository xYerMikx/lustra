import { Inject, Injectable } from '@nestjs/common'
import type {
  ConfirmBookingInput,
  ConfirmBookingResponse,
} from '@lustra/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import { TransactionManager } from '@/common/prisma/transaction-manager.service'
import { ClockService } from '@/common/time/clock.service'
import type { BookingStore } from '@/modules/bookings/app/booking.ports'
import { resolveConfirmFromHold } from '@/modules/bookings/domain/booking-status.machine'
import { toBookingClientView } from '@/modules/bookings/domain/map-booking'
import { BookingRepository } from '@/modules/bookings/infra/booking.repository'

@Injectable()
export class ConfirmBookingUseCase {
  constructor(
    @Inject(BookingRepository)
    private readonly bookings: BookingStore,
    private readonly tx: TransactionManager,
    private readonly clock: ClockService,
  ) {}

  async execute(
    actor: AuthUser,
    bookingId: string,
    input: ConfirmBookingInput,
  ): Promise<ConfirmBookingResponse> {
    const booking = await this.bookings.findBookingById(bookingId)

    if (!booking || booking.clientUserId !== actor.id) {
      throw DomainError.notFound('Бронь не найдена')
    }

    const policy = await this.bookings.getPolicy(booking.masterId)

    if (!policy) {
      throw new DomainError('NOT_FOUND', 'Политика бронирования не найдена')
    }

    const now = this.clock.now()
    const transition = resolveConfirmFromHold({
      status: booking.status,
      holdExpiresAt: booking.holdExpiresAt,
      now,
      autoConfirm: policy.autoConfirm,
    })

    if (!transition.ok) {
      if (transition.reason === 'expired') {
        throw DomainError.holdExpired()
      }

      throw DomainError.invalidState('Бронь уже не в статусе удержания')
    }

    const confirmed = await this.tx.run(async () => {
      return this.bookings.confirmHold({
        bookingId,
        clientUserId: actor.id,
        toStatus: transition.toStatus,
        clientComment: input.comment?.trim() ? input.comment.trim() : null,
        confirmedAt:
          transition.toStatus === 'confirmed' ? now : null,
        now,
      })
    })

    if (!confirmed) {
      throw DomainError.holdExpired()
    }

    return { booking: toBookingClientView(confirmed) }
  }
}
