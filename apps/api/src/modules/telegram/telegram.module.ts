import { Module } from '@nestjs/common'

import { AuthModule } from '@/modules/auth/auth.module'
import { NotificationsModule } from '@/modules/notifications/notifications.module'
import { TelegramController } from '@/modules/telegram/api/telegram.controller'
import { HandleTelegramUpdateUseCase } from '@/modules/telegram/app/handle-telegram-update.usecase'
import { StartTelegramLinkUseCase } from '@/modules/telegram/app/start-telegram-link.usecase'
import { UnlinkTelegramUseCase } from '@/modules/telegram/app/unlink-telegram.usecase'
import { TelegramAccountRepository } from '@/modules/telegram/infra/telegram-account.repository'

@Module({
  imports: [AuthModule, NotificationsModule],
  controllers: [TelegramController],
  providers: [
    TelegramAccountRepository,
    StartTelegramLinkUseCase,
    UnlinkTelegramUseCase,
    HandleTelegramUpdateUseCase,
  ],
})
export class TelegramModule {}
