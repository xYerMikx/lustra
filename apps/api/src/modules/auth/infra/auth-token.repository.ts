import { Injectable } from '@nestjs/common'
import type { AuthToken, AuthTokenKind } from '@lumira/db'

import { TransactionManager } from '@/common/prisma/transaction-manager.service'

export const AUTH_TOKEN_ALREADY_USED = 'AUTH_TOKEN_ALREADY_USED'

@Injectable()
export class AuthTokenRepository {
  constructor(private readonly tx: TransactionManager) {}

  create(input: {
    userId: string
    kind: AuthTokenKind
    tokenHash: string
    expiresAt: Date
  }): Promise<AuthToken> {
    return this.tx.getClient().authToken.create({
      data: {
        userId: input.userId,
        kind: input.kind,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
      },
    })
  }

  findByHash(kind: AuthTokenKind, tokenHash: string): Promise<AuthToken | null> {
    return this.tx.getClient().authToken.findFirst({
      where: { kind, tokenHash },
    })
  }

  async invalidateUnused(userId: string, kind: AuthTokenKind, now: Date): Promise<void> {
    await this.tx.getClient().authToken.updateMany({
      where: {
        userId,
        kind,
        usedAt: null,
      },
      data: { usedAt: now },
    })
  }

  async markUsed(id: string, now: Date): Promise<void> {
    const marked = await this.tx.getClient().authToken.updateMany({
      where: { id, usedAt: null },
      data: { usedAt: now },
    })

    if (marked.count !== 1) {
      throw new Error(AUTH_TOKEN_ALREADY_USED)
    }
  }
}
