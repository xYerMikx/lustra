import { Injectable } from '@nestjs/common'

import { hashToken } from '../domain/token-hash'
import { RefreshSessionRepository } from '../infra/refresh-session.repository'

@Injectable()
export class LogoutUseCase {
  constructor(private readonly sessions: RefreshSessionRepository) {}

  async execute(rawRefreshToken: string | undefined): Promise<void> {
    if (!rawRefreshToken) {
      return
    }

    const tokenHash = hashToken(rawRefreshToken)
    const current = await this.sessions.findByTokenHash(tokenHash)
    if (!current || current.revokedAt) {
      return
    }

    await this.sessions.revoke(current.id)
  }
}
