import { timingSafeEqual } from 'node:crypto'

import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common'
import { SkipThrottle, Throttle } from '@nestjs/throttler'
import type { OkResponse, TelegramLinkStartResponse } from '@lumira/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { CurrentUser } from '@/common/auth/current-user.decorator'
import { JwtGuard } from '@/common/auth/jwt.guard'
import { Roles } from '@/common/auth/roles.decorator'
import { RolesGuard } from '@/common/auth/roles.guard'
import { DomainError } from '@/common/errors/domain-error'
import { ProbeTelegramUseCase } from '@/modules/notifications/app/probe-telegram.usecase'
import { HandleTelegramUpdateUseCase } from '@/modules/telegram/app/handle-telegram-update.usecase'
import { StartTelegramLinkUseCase } from '@/modules/telegram/app/start-telegram-link.usecase'
import { UnlinkTelegramUseCase } from '@/modules/telegram/app/unlink-telegram.usecase'

@Controller('telegram')
export class TelegramController {
  constructor(
    private readonly startLink: StartTelegramLinkUseCase,
    private readonly unlink: UnlinkTelegramUseCase,
    private readonly handleUpdate: HandleTelegramUpdateUseCase,
    private readonly probeTelegram: ProbeTelegramUseCase,
  ) {}

  @Post('link/start')
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('client', 'master', 'admin')
  start(@CurrentUser() user: AuthUser): Promise<TelegramLinkStartResponse> {
    return this.startLink.execute(user)
  }

  @Delete('link')
  @HttpCode(200)
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('client', 'master', 'admin')
  remove(@CurrentUser() user: AuthUser): Promise<OkResponse> {
    return this.unlink.execute(user)
  }

  @Post('probe/:bookingId')
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('client', 'master')
  probe(
    @CurrentUser() user: AuthUser,
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
  ): Promise<OkResponse> {
    return this.probeTelegram.execute(user, bookingId)
  }

  @Post('webhook/:secret')
  @HttpCode(200)
  @SkipThrottle()
  async webhook(
    @Param('secret') secret: string,
    @Body() body: unknown,
  ): Promise<{ ok: true }> {
    if (!webhookSecretMatches(secret)) {
      throw DomainError.notFound('Не найдено')
    }

    await this.handleUpdate.execute(asTelegramUpdate(body))

    return { ok: true }
  }
}

function webhookSecretMatches(provided: string): boolean {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET?.trim() ?? ''

  if (!expected || !provided) {
    return false
  }

  const left = Buffer.from(provided)
  const right = Buffer.from(expected)

  if (left.length !== right.length) {
    return false
  }

  return timingSafeEqual(left, right)
}

function asTelegramUpdate(body: unknown): {
  message?: {
    text?: string
    chat?: { id?: number }
    from?: { username?: string }
  }
} {
  if (typeof body !== 'object' || body === null) {
    return {}
  }

  return body
}
