import { Inject, Injectable, Logger } from '@nestjs/common'

import { ClockService } from '@/common/time/clock.service'
import type { NotificationStore } from '@/modules/notifications/app/notifications.ports'
import { NOTIFICATION_STORE } from '@/modules/notifications/app/notifications.ports'
import { HandleOutboxEventUseCase } from '@/modules/notifications/app/handle-outbox-event.usecase'

const BATCH = 50
const MAX_ATTEMPTS = 8
const LEASE_MS = 2 * 60 * 1000

@Injectable()
export class PublishOutboxUseCase {
  private readonly logger = new Logger(PublishOutboxUseCase.name)

  constructor(
    @Inject(NOTIFICATION_STORE)
    private readonly store: NotificationStore,
    private readonly handleOutbox: HandleOutboxEventUseCase,
    private readonly clock: ClockService,
  ) {}

  async execute(): Promise<void> {
    const now = this.clock.now()
    const leaseUntil = new Date(now.getTime() + LEASE_MS)
    const claimed = await this.store.claimPending(BATCH, now, leaseUntil)

    for (const event of claimed) {
      try {
        await this.handleOutbox.execute(event)
        await this.store.markDone(event.id, this.clock.now())
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'outbox handle failed'
        const failed = event.attempts >= MAX_ATTEMPTS
        const backoffMs = Math.min(
          10 * 60 * 1000,
          30_000 * 2 ** Math.max(0, event.attempts - 1),
        )

        this.logger.error(error, `outbox ${event.id} ${event.type}`)
        await this.store.markRetry({
          id: event.id,
          attempts: event.attempts,
          availableAt: new Date(this.clock.now().getTime() + backoffMs),
          lastError: message,
          failed,
        })
      }
    }
  }
}
