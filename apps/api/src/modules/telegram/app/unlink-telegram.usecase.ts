import { Injectable } from '@nestjs/common'
import type { OkResponse } from '@lustra/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { TelegramAccountRepository } from '@/modules/telegram/infra/telegram-account.repository'

@Injectable()
export class UnlinkTelegramUseCase {
  constructor(private readonly accounts: TelegramAccountRepository) {}

  async execute(currentUser: AuthUser): Promise<OkResponse> {
    await this.accounts.unlink(currentUser.id)

    return { ok: true }
  }
}
