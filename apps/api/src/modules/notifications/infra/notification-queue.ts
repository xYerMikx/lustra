import { Logger } from '@nestjs/common'
import { Queue, Worker } from 'bullmq'
import Redis from 'ioredis'

import type {
  NotificationQueue,
  NotificationQueueJob,
} from '@/modules/notifications/app/notifications.ports'
import type { SendTelegramUseCase } from '@/modules/notifications/app/send-telegram.usecase'

export const NOTIFICATIONS_QUEUE_NAME = 'notifications'
export const TELEGRAM_SEND_JOB = 'telegram.send'

export class InMemoryNotificationQueue implements NotificationQueue {
  private readonly logger = new Logger(InMemoryNotificationQueue.name)
  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>()

  constructor(private readonly sendTelegram: SendTelegramUseCase) {}

  async addTelegramSend(input: {
    jobId: string
    delayMs: number
    payload: NotificationQueueJob
  }): Promise<void> {
    await this.remove(input.jobId)

    const timer = setTimeout(() => {
      this.timers.delete(input.jobId)
      void this.sendTelegram.execute(input.payload).catch((error: unknown) => {
        this.logger.error(error, `in-memory telegram job ${input.jobId} failed`)
      })
    }, input.delayMs)

    this.timers.set(input.jobId, timer)
  }

  async remove(jobId: string): Promise<void> {
    const timer = this.timers.get(jobId)

    if (!timer) {
      return
    }

    clearTimeout(timer)
    this.timers.delete(jobId)
  }

  async close(): Promise<void> {
    for (const timer of this.timers.values()) {
      clearTimeout(timer)
    }

    this.timers.clear()
  }
}

export class BullMqNotificationQueue implements NotificationQueue {
  private readonly queue: Queue<NotificationQueueJob>
  private readonly worker: Worker<NotificationQueueJob>
  private readonly connection: Redis
  private readonly workerConnection: Redis

  constructor(redisUrl: string, sendTelegram: SendTelegramUseCase) {
    this.connection = new Redis(redisUrl, { maxRetriesPerRequest: null })
    this.workerConnection = this.connection.duplicate()
    this.queue = new Queue<NotificationQueueJob>(NOTIFICATIONS_QUEUE_NAME, {
      connection: this.connection,
    })
    this.worker = new Worker<NotificationQueueJob>(
      NOTIFICATIONS_QUEUE_NAME,
      async (job) => {
        await sendTelegram.execute(job.data)
      },
      { connection: this.workerConnection },
    )
  }

  async addTelegramSend(input: {
    jobId: string
    delayMs: number
    payload: NotificationQueueJob
  }): Promise<void> {
    await this.queue.add(TELEGRAM_SEND_JOB, input.payload, {
      jobId: input.jobId,
      delay: Math.max(0, input.delayMs),
      attempts: 5,
      backoff: { type: 'exponential', delay: 30_000 },
      removeOnComplete: 1000,
      removeOnFail: 5000,
    })
  }

  async remove(jobId: string): Promise<void> {
    const job = await this.queue.getJob(jobId)

    if (!job) {
      return
    }

    await job.remove()
  }

  async close(): Promise<void> {
    await this.worker.close()
    await this.queue.close()
    this.workerConnection.disconnect()
    this.connection.disconnect()
  }
}

export function createNotificationQueue(
  sendTelegram: SendTelegramUseCase,
): NotificationQueue & { close?: () => Promise<void> } {
  const redisUrl = process.env.REDIS_URL?.trim()

  if (redisUrl) {
    return new BullMqNotificationQueue(redisUrl, sendTelegram)
  }

  return new InMemoryNotificationQueue(sendTelegram)
}
