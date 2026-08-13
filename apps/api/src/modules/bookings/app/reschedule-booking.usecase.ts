import { Inject, Injectable } from '@nestjs/common'
import {
  isGranularityMin,
  type MasterBookingResponse,
  type RescheduleBookingInput,
} from '@lustra/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import { TransactionManager } from '@/common/prisma/transaction-manager.service'
import { ClockService } from '@/common/time/clock.service'
import type { BookingStore } from '@/modules/bookings/app/booking.ports'
import {
  isBookingOverlapRace,
  isBookingRaceConstraint,
} from '@/modules/bookings/domain/booking-race'
import { resolveMasterReschedule } from '@/modules/bookings/domain/booking-status.machine'
import { toBookingMasterView } from '@/modules/bookings/domain/map-booking'
import {
  appointmentEndsAt,
  holdCoverageEndsAt,
} from '@/modules/bookings/domain/slot-holdability'
import { BookingRepository } from '@/modules/bookings/infra/booking.repository'
import { EnsureSlotsUseCase } from '@/modules/scheduling/app/ensure-slots.usecase'
import {
  MASTER_TIMEZONE,
  addDaysToYmdDate,
  formatYmdDateInTimeZone,
} from '@/modules/scheduling/domain/tz'

@Injectable()
export class RescheduleBookingUseCase {
  constructor(
    @Inject(BookingRepository)
    private readonly bookings: BookingStore,
    private readonly tx: TransactionManager,
    private readonly clock: ClockService,
    private readonly ensureSlots: EnsureSlotsUseCase,
  ) {}

  async execute(
    currentUser: AuthUser,
    bookingId: string,
    input: RescheduleBookingInput,
  ): Promise<MasterBookingResponse> {
    const masterId = await this.bookings.findMasterIdByUserId(currentUser.id)

    if (!masterId) {
      throw DomainError.notFound('Профиль мастера не найден')
    }

    const booking = await this.bookings.findBookingById(bookingId)

    if (!booking || booking.masterId !== masterId) {
      throw DomainError.notFound('Бронь не найдена')
    }

    const startsAt = new Date(input.startsAt)
    const decision = resolveMasterReschedule({
      status: booking.status,
      currentStartsAt: booking.startsAt,
      nextStartsAt: startsAt,
    })

    if (!decision.ok) {
      if (decision.reason === 'same_time') {
        throw DomainError.invalidState('Это то же время')
      }

      throw DomainError.invalidState('Бронь нельзя перенести в этом статусе')
    }

    const policy = await this.bookings.getPolicy(masterId)

    if (!policy) {
      throw DomainError.notFound('Политика бронирования не найдена')
    }

    if (!isGranularityMin(policy.granularityMin)) {
      throw new DomainError('VALIDATION_FAILED', 'Некорректный шаг сетки')
    }

    const now = this.clock.now()
    const todayYmd = formatYmdDateInTimeZone(now, MASTER_TIMEZONE)
    const horizonEndYmd = addDaysToYmdDate(todayYmd, policy.maxHorizonDays)
    const startYmd = formatYmdDateInTimeZone(startsAt, MASTER_TIMEZONE)

    if (startYmd > horizonEndYmd) {
      throw new DomainError(
        'VALIDATION_FAILED',
        'Дата вне горизонта записи мастера',
      )
    }

    await this.ensureSlots.execute({
      masterId,
      fromYmdDate: startYmd,
      toYmdDate: startYmd,
    })

    let bufferMin = policy.bufferAfterMin

    if (booking.serviceId) {
      const service = await this.bookings.findService(masterId, booking.serviceId)

      if (service) {
        bufferMin += service.bufferAfterMin
      }
    }

    const coverageEnd = holdCoverageEndsAt(
      startsAt,
      booking.serviceDurationMin,
      bufferMin,
    )
    const endsAt = appointmentEndsAt(startsAt, booking.serviceDurationMin)
    const reason = input.reason.trim()

    try {
      const moved = await this.tx.run(() =>
        this.bookings.rescheduleBooking({
          bookingId,
          masterId,
          currentUserId: currentUser.id,
          startsAt,
          endsAt,
          coverageEnd,
          granularityMin: policy.granularityMin,
          bufferMin,
          reason,
          now,
        }),
      )

      if (!moved) {
        throw DomainError.invalidState('Бронь уже изменена')
      }

      return { booking: toBookingMasterView(moved) }
    } catch (error: unknown) {
      if (error instanceof DomainError) {
        throw error
      }

      if (isBookingOverlapRace(error)) {
        throw new DomainError(
          'TIME_OVERLAP',
          'Это время пересекается с другой записью',
        )
      }

      if (isBookingRaceConstraint(error)) {
        throw DomainError.slotTaken()
      }

      throw error
    }
  }
}
