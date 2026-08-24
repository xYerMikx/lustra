import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common'

import type { NotificationQueue } from '@/modules/notifications/app/notifications.ports'
import { NOTIFICATION_QUEUE } from '@/modules/notifications/app/notifications.ports'
import { PublishOutboxUseCase } from '@/modules/notifications/app/publish-outbox.usecase'

const POLL_MS = 1000

type ClosableQueue = NotificationQueue & { close?: () => Promise<void> }

@Injectable()
export class OutboxPoller implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxPoller.name)
  private timer: ReturnType<typeof setInterval> | null = null
  private running = false

  constructor(
    private readonly publishOutbox: PublishOutboxUseCase,
    @Inject(NOTIFICATION_QUEUE)
    private readonly queue: ClosableQueue,
  ) {}

  onModuleInit(): void {
    this.timer = setInterval(() => {
      void this.tick()
    }, POLL_MS)
  }

  async onModuleDestroy(): Promise<void> {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }

    if (this.queue.close) {
      await this.queue.close()
    }
  }

  private async tick(): Promise<void> {
    if (this.running) {
      return
    }

    this.running = true

    try {
      await this.publishOutbox.execute()
    } catch (error: unknown) {
      this.logger.error(error, 'outbox poll failed')
    } finally {
      this.running = false
    }
  }
}
