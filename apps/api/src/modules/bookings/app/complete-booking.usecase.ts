import { Inject, Injectable } from '@nestjs/common'
import type { MasterBookingResponse } from '@lumira/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { isDevelopment } from '@/common/env/is-production'
import { DomainError } from '@/common/errors/domain-error'
import { TransactionManager } from '@/common/prisma/transaction-manager.service'
import { ClockService } from '@/common/time/clock.service'
import type { BookingStore } from '@/modules/bookings/app/booking.ports'
import { resolveMasterComplete } from '@/modules/bookings/domain/booking-status.machine'
import { toBookingMasterView } from '@/modules/bookings/domain/map-booking'
import { BookingRepository } from '@/modules/bookings/infra/booking.repository'

@Injectable()
export class CompleteBookingUseCase {
  constructor(
    @Inject(BookingRepository)
    private readonly bookings: BookingStore,
    private readonly tx: TransactionManager,
    private readonly clock: ClockService,
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

    const now = this.clock.now()
    const decision = resolveMasterComplete({
      status: booking.status,
      startsAt: booking.startsAt,
      now,
      relaxTimeGuards: isDevelopment,
    })

    if (!decision.ok && decision.reason === 'visit_not_started') {
      throw DomainError.invalidState('Завершить можно после начала визита')
    }

    if (!decision.ok) {
      throw DomainError.invalidState('Завершить можно только подтверждённую бронь')
    }

    const completed = await this.tx.run(async () => {
      return this.bookings.completeBooking({
        bookingId,
        masterId,
        currentUserId: currentUser.id,
        now,
      })
    })

    if (!completed) {
      throw DomainError.invalidState('Бронь уже изменена')
    }

    return { booking: toBookingMasterView(completed) }
  }
}
