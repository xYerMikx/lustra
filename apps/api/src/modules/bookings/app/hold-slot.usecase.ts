import { randomUUID } from 'node:crypto'

import { Inject, Injectable } from '@nestjs/common'
import { isGranularityMin, type HoldSlotInput, type HoldSlotResponse } from '@lustra/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import { TransactionManager } from '@/common/prisma/transaction-manager.service'
import { ClockService } from '@/common/time/clock.service'
import type { BookingStore } from '@/modules/bookings/app/booking.ports'
import { isBookingRaceConstraint } from '@/modules/bookings/domain/booking-race'
import { toBookingClientView } from '@/modules/bookings/domain/map-booking'
import {
  appointmentEndsAt,
  areSlotsConsecutive,
  granuleNeedCount,
  holdCoverageEndsAt,
  isSlotHoldable,
} from '@/modules/bookings/domain/slot-holdability'
import { sumSlotExtraPay } from '@/modules/bookings/domain/sum-slot-extra-pay'
import { BookingRepository } from '@/modules/bookings/infra/booking.repository'
import { EnsureSlotsUseCase } from '@/modules/scheduling/app/ensure-slots.usecase'
import {
  MASTER_TIMEZONE,
  addDaysToYmdDate,
  formatYmdDateInTimeZone,
} from '@/modules/scheduling/domain/tz'

@Injectable()
export class HoldSlotUseCase {
  constructor(
    @Inject(BookingRepository)
    private readonly bookings: BookingStore,
    private readonly tx: TransactionManager,
    private readonly clock: ClockService,
    private readonly ensureSlots: EnsureSlotsUseCase,
  ) {}

  async execute(
    currentUser: AuthUser,
    input: HoldSlotInput,
    idempotencyKey: string,
  ): Promise<HoldSlotResponse> {
    if (!idempotencyKey.trim()) {
      throw new DomainError('VALIDATION_FAILED', 'Нужен заголовок Idempotency-Key', {
        fieldErrors: { 'Idempotency-Key': ['Обязательный заголовок'] },
      })
    }

    const existing = await this.bookings.findBookingByIdempotencyKey(idempotencyKey)

    if (existing) {
      if (existing.clientUserId !== currentUser.id) {
        throw new DomainError('FORBIDDEN', 'Ключ идемпотентности уже использован')
      }

      if (!existing.holdExpiresAt) {
        throw DomainError.invalidState('Бронь по этому ключу уже подтверждена')
      }

      return {
        bookingId: existing.id,
        holdExpiresAt: existing.holdExpiresAt.toISOString(),
        summary: toBookingClientView(existing),
      }
    }

    const visible = await this.bookings.findMasterPubliclyVisible(input.masterId)

    if (!visible) {
      throw new DomainError('NOT_FOUND', 'Мастер не найден')
    }

    const service = await this.bookings.findService(input.masterId, input.serviceId)

    if (!service || !service.isActive) {
      throw new DomainError('NOT_FOUND', 'Услуга не найдена')
    }

    const policy = await this.bookings.getPolicy(input.masterId)

    if (!policy) {
      throw new DomainError('NOT_FOUND', 'Политика бронирования не найдена')
    }

    if (!isGranularityMin(policy.granularityMin)) {
      throw new DomainError('VALIDATION_FAILED', 'Некорректный шаг сетки')
    }

    const clientUser = await this.bookings.findClientUser(currentUser.id)

    if (!clientUser) {
      throw DomainError.forbidden('Бронировать может только клиент')
    }

    const startsAt = new Date(input.startsAt)
    const now = this.clock.now()
    const earliest = new Date(now.getTime() + policy.minLeadTimeMin * 60_000)

    if (startsAt.getTime() < earliest.getTime()) {
      throw new DomainError(
        'LEAD_TIME_VIOLATION',
        'Слишком близко к началу — мастер принимает запись позже',
      )
    }

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
      masterId: input.masterId,
      fromYmdDate: startYmd,
      toYmdDate: startYmd,
    })

    const bufferAfterMin = service.bufferAfterMin + policy.bufferAfterMin
    const needCount = granuleNeedCount(
      service.durationMin,
      bufferAfterMin,
      policy.granularityMin,
    )
    const rangeEndExclusive = holdCoverageEndsAt(
      startsAt,
      service.durationMin,
      bufferAfterMin,
    )
    const holdId = randomUUID()
    const holdExpiresAt = new Date(now.getTime() + policy.holdTtlSec * 1000)
    const endsAt = appointmentEndsAt(startsAt, service.durationMin)

    try {
      const booking = await this.tx.run(async () => {
        const masterClient = await this.bookings.upsertMasterClient({
          masterId: input.masterId,
          userId: clientUser.id,
          name: clientUser.firstName,
          phone: clientUser.phone,
        })

        if (masterClient.isBlocked) {
          throw DomainError.forbidden('Мастер ограничил запись для этого клиента')
        }

        const activeCount = await this.bookings.countActiveBookingsForClient(
          input.masterId,
          clientUser.id,
        )

        if (activeCount >= policy.maxActiveBookingsPerClient) {
          throw new DomainError(
            'LIMIT_EXCEEDED',
            'Достигнут лимит активных записей у этого мастера',
          )
        }

        const granules = await this.bookings.listGranulesInRange({
          masterId: input.masterId,
          rangeStart: startsAt,
          rangeEndExclusive,
        })

        if (
          granules.length !== needCount ||
          !areSlotsConsecutive(granules, policy.granularityMin)
        ) {
          throw DomainError.slotTaken()
        }

        const first = granules[0]

        if (!first || first.startsAt.getTime() !== startsAt.getTime()) {
          throw DomainError.slotTaken()
        }

        for (const slot of granules) {
          if (!isSlotHoldable(slot, now)) {
            throw DomainError.slotTaken()
          }
        }

        const extraPay = sumSlotExtraPay(granules)
        const priceAmount =
          extraPay === '0.00'
            ? String(service.price)
            : (Number(service.price) + Number(extraPay)).toFixed(2)

        return this.bookings.createHold({
          masterId: input.masterId,
          masterClientId: masterClient.id,
          clientUserId: clientUser.id,
          serviceId: service.id,
          serviceTitle: service.title,
          serviceDurationMin: service.durationMin,
          bufferMin: bufferAfterMin,
          priceAmount,
          currency: service.currency,
          startsAt,
          endsAt,
          holdId,
          holdExpiresAt,
          idempotencyKey,
          slotIds: granules.map((slot) => slot.id),
          now,
        })
      })

      return {
        bookingId: booking.id,
        holdExpiresAt: holdExpiresAt.toISOString(),
        summary: toBookingClientView(booking),
      }
    } catch (error: unknown) {
      if (error instanceof DomainError) {
        throw error
      }

      if (isBookingRaceConstraint(error)) {
        throw DomainError.slotTaken()
      }

      throw error
    }
  }
}
