import { Injectable } from '@nestjs/common'
import type { Prisma } from '@lustra/db'

import { PRISMA_ERROR } from '@/common/db/prisma-error-codes'
import { TransactionManager } from '@/common/prisma/transaction-manager.service'
import type {
  NotificationStore,
  NotifyBookingSnapshot,
  NotifyRecipient,
} from '@/modules/notifications/app/notifications.ports'
import type { NotifyTemplate } from '@/modules/notifications/domain/notify-template'

type ClaimedOutboxRow = {
  id: string
  type: string
  payload: unknown
  attempts: number
}

@Injectable()
export class NotificationRepository implements NotificationStore {
  constructor(private readonly tx: TransactionManager) {}

  async claimPending(
    limit: number,
    now: Date,
    leaseUntil: Date,
  ): Promise<ClaimedOutboxRow[]> {
    const db = this.tx.getClient()

    const rows = await db.$queryRaw<ClaimedOutboxRow[]>`
      UPDATE "OutboxEvent"
      SET
        status = 'processing'::"OutboxStatus",
        attempts = attempts + 1,
        "availableAt" = ${leaseUntil}
      WHERE id IN (
        SELECT id
        FROM "OutboxEvent"
        WHERE
          (
            status = 'pending'::"OutboxStatus"
            OR status = 'processing'::"OutboxStatus"
          )
          AND "availableAt" <= ${now}
        ORDER BY "createdAt" ASC
        LIMIT ${limit}
        FOR UPDATE SKIP LOCKED
      )
      RETURNING id, type, payload, attempts
    `

    return rows
  }

  async markDone(id: string, now: Date): Promise<void> {
    await this.tx.getClient().outboxEvent.update({
      where: { id },
      data: {
        status: 'done',
        processedAt: now,
        lastError: null,
      },
    })
  }

  async markRetry(input: {
    id: string
    attempts: number
    availableAt: Date
    lastError: string
    failed: boolean
  }): Promise<void> {
    await this.tx.getClient().outboxEvent.update({
      where: { id: input.id },
      data: {
        status: input.failed ? 'failed' : 'pending',
        attempts: input.attempts,
        availableAt: input.availableAt,
        lastError: input.lastError.slice(0, 1000),
      },
    })
  }

  async findBookingSnapshot(
    bookingId: string,
  ): Promise<NotifyBookingSnapshot | null> {
    const row = await this.tx.getClient().booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        status: true,
        startsAt: true,
        createdAt: true,
        confirmedAt: true,
        serviceTitle: true,
        cancelReason: true,
        clientUserId: true,
        master: {
          select: {
            userId: true,
            displayName: true,
          },
        },
        masterClient: {
          select: { name: true },
        },
      },
    })

    if (!row) {
      return null
    }

    return {
      id: row.id,
      status: row.status,
      startsAt: row.startsAt,
      bookedAt: row.confirmedAt ?? row.createdAt,
      serviceTitle: row.serviceTitle,
      masterDisplayName: row.master.displayName,
      clientName: row.masterClient.name,
      clientUserId: row.clientUserId,
      masterUserId: row.master.userId,
      cancelReason: row.cancelReason,
    }
  }

  async findRecipient(userId: string): Promise<NotifyRecipient | null> {
    const row = await this.tx.getClient().user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        telegram: {
          select: { chatId: true, isBlocked: true },
        },
        notifySetting: {
          select: {
            telegramEnabled: true,
            reminder24hEnabled: true,
            reminder2hEnabled: true,
            quietHoursEnabled: true,
          },
        },
      },
    })

    if (!row) {
      return null
    }

    return {
      userId: row.id,
      chatId: row.telegram ? row.telegram.chatId.toString() : null,
      isBlocked: row.telegram?.isBlocked ?? false,
      telegramEnabled: row.notifySetting?.telegramEnabled ?? true,
      reminder24hEnabled: row.notifySetting?.reminder24hEnabled ?? true,
      reminder2hEnabled: row.notifySetting?.reminder2hEnabled ?? true,
      quietHoursEnabled: row.notifySetting?.quietHoursEnabled ?? true,
    }
  }

  async tryInsertLog(input: {
    userId: string
    template: NotifyTemplate
    bookingId: string
    dedupeKey: string
    jobId: string
  }): Promise<'inserted' | 'duplicate'> {
    try {
      await this.tx.getClient().notificationLog.create({
        data: {
          userId: input.userId,
          channel: 'telegram',
          template: input.template,
          bookingId: input.bookingId,
          dedupeKey: input.dedupeKey,
          jobId: input.jobId,
          status: 'queued',
        },
      })

      return 'inserted'
    } catch (error: unknown) {
      if (isUniqueConflict(error)) {
        return 'duplicate'
      }

      throw error
    }
  }

  async markLogSent(dedupeKey: string, now: Date): Promise<void> {
    await this.tx.getClient().notificationLog.update({
      where: { dedupeKey },
      data: { status: 'sent', sentAt: now, error: null },
    })
  }

  async markLogSkipped(dedupeKey: string, error: string): Promise<void> {
    await this.tx.getClient().notificationLog.update({
      where: { dedupeKey },
      data: { status: 'skipped', error: error.slice(0, 1000) },
    })
  }

  async markLogFailed(dedupeKey: string, error: string): Promise<void> {
    await this.tx.getClient().notificationLog.update({
      where: { dedupeKey },
      data: { status: 'failed', error: error.slice(0, 1000) },
    })
  }

  async markTelegramBlocked(userId: string): Promise<void> {
    await this.tx.getClient().telegramAccount.updateMany({
      where: { userId },
      data: { isBlocked: true },
    })
  }
}

function isUniqueConflict(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as Prisma.PrismaClientKnownRequestError).code ===
      PRISMA_ERROR.UNIQUE_CONSTRAINT
  )
}
