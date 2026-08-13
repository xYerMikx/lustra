import { Inject, Injectable } from '@nestjs/common'
import {
  isGranularityMin,
  type CreateManualBookingInput,
  type MasterBookingResponse,
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
export class CreateManualBookingUseCase {
  constructor(
    @Inject(BookingRepository)
    private readonly bookings: BookingStore,
    private readonly tx: TransactionManager,
    private readonly clock: ClockService,
    private readonly ensureSlots: EnsureSlotsUseCase,
  ) {}

  async execute(
    currentUser: AuthUser,
    input: CreateManualBookingInput,
  ): Promise<MasterBookingResponse> {
    const masterId = await this.bookings.findMasterIdByUserId(currentUser.id)

    if (!masterId) {
      throw DomainError.notFound('Профиль мастера не найден')
    }

    const service = await this.bookings.findService(masterId, input.serviceId)

    if (!service || !service.isActive) {
      throw DomainError.notFound('Услуга не найдена')
    }

    const policy = await this.bookings.getPolicy(masterId)

    if (!policy) {
      throw DomainError.notFound('Политика бронирования не найдена')
    }

    if (!isGranularityMin(policy.granularityMin)) {
      throw new DomainError('VALIDATION_FAILED', 'Некорректный шаг сетки')
    }

    const startsAt = new Date(input.startsAt)
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

    const bufferAfterMin = service.bufferAfterMin + policy.bufferAfterMin
    const coverageEnd = holdCoverageEndsAt(
      startsAt,
      service.durationMin,
      bufferAfterMin,
    )
    const endsAt = appointmentEndsAt(startsAt, service.durationMin)
    const masterNote = input.note?.trim() ? input.note.trim() : null

    try {
      const booking = await this.tx.run(() =>
        this.bookings.createManualBooking({
          masterId,
          currentUserId: currentUser.id,
          serviceId: service.id,
          serviceTitle: service.title,
          serviceDurationMin: service.durationMin,
          bufferMin: bufferAfterMin,
          priceAmount: String(service.price),
          currency: service.currency,
          startsAt,
          endsAt,
          coverageEnd,
          granularityMin: policy.granularityMin,
          channel: input.channel,
          clientName: input.clientName,
          phone: input.phone,
          masterNote,
          now,
        }),
      )

      return { booking: toBookingMasterView(booking) }
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
