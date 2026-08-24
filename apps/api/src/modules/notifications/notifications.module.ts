import { Module } from '@nestjs/common'

import { PrismaModule } from '@/common/prisma/prisma.module'
import {
  NOTIFICATION_QUEUE,
  NOTIFICATION_STORE,
  TELEGRAM_SENDER,
} from '@/modules/notifications/app/notifications.ports'
import { CancelRemindersUseCase } from '@/modules/notifications/app/cancel-reminders.usecase'
import { EnqueueCancelNoticesUseCase } from '@/modules/notifications/app/enqueue-cancel-notices.usecase'
import { HandleOutboxEventUseCase } from '@/modules/notifications/app/handle-outbox-event.usecase'
import { ProbeTelegramUseCase } from '@/modules/notifications/app/probe-telegram.usecase'
import { PublishOutboxUseCase } from '@/modules/notifications/app/publish-outbox.usecase'
import { ScheduleRemindersUseCase } from '@/modules/notifications/app/schedule-reminders.usecase'
import { SendTelegramUseCase } from '@/modules/notifications/app/send-telegram.usecase'
import { createNotificationQueue } from '@/modules/notifications/infra/notification-queue'
import { NotificationRepository } from '@/modules/notifications/infra/notification.repository'
import { OutboxPoller } from '@/modules/notifications/infra/outbox-poller'
import { TelegramBotSender } from '@/modules/notifications/infra/telegram-bot.sender'

@Module({
  imports: [PrismaModule],
  providers: [
    NotificationRepository,
    {
      provide: NOTIFICATION_STORE,
      useExisting: NotificationRepository,
    },
    TelegramBotSender,
    {
      provide: TELEGRAM_SENDER,
      useExisting: TelegramBotSender,
    },
    SendTelegramUseCase,
    ProbeTelegramUseCase,
    {
      provide: NOTIFICATION_QUEUE,
      useFactory: (sendTelegram: SendTelegramUseCase) => {
        return createNotificationQueue(sendTelegram)
      },
      inject: [SendTelegramUseCase],
    },
    ScheduleRemindersUseCase,
    CancelRemindersUseCase,
    EnqueueCancelNoticesUseCase,
    HandleOutboxEventUseCase,
    PublishOutboxUseCase,
    OutboxPoller,
  ],
  exports: [TELEGRAM_SENDER, NOTIFICATION_STORE, ProbeTelegramUseCase],
})
export class NotificationsModule {}
