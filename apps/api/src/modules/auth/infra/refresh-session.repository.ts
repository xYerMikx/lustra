import { Injectable } from '@nestjs/common'
import type { RefreshSession } from '@lumira/db'

import { REFRESH_TTL_SEC } from '@/common/auth/cookie.constants'
import { TransactionManager } from '@/common/prisma/transaction-manager.service'
import { REFRESH_ROTATE_RACE } from '@/modules/auth/domain/refresh-errors'
import {
  generateFamilyId,
  generateRefreshToken,
  hashToken,
} from '@/modules/auth/domain/token-hash'

export type CreatedRefreshSession = {
  rawToken: string
  session: RefreshSession
}

type CreateSessionInput = {
  userId: string
  userAgent?: string
  ip?: string
  familyId?: string
}

@Injectable()
export class RefreshSessionRepository {
  constructor(private readonly tx: TransactionManager) {}

  async create(input: CreateSessionInput): Promise<CreatedRefreshSession> {
    const rawToken = generateRefreshToken()
    const tokenHash = hashToken(rawToken)
    const familyId = input.familyId ?? generateFamilyId()
    const expiresAt = new Date(Date.now() + REFRESH_TTL_SEC * 1000)

    const session = await this.tx.getClient().refreshSession.create({
      data: {
        userId: input.userId,
        tokenHash,
        familyId,
        expiresAt,
        userAgent: input.userAgent,
        ip: input.ip,
      },
    })

    return { rawToken, session }
  }

  findByTokenHash(tokenHash: string): Promise<RefreshSession | null> {
    return this.tx.getClient().refreshSession.findUnique({ where: { tokenHash } })
  }

  async rotate(params: {
    current: RefreshSession
    userAgent?: string
    ip?: string
  }): Promise<CreatedRefreshSession> {
    const rawToken = generateRefreshToken()
    const tokenHash = hashToken(rawToken)
    const expiresAt = new Date(Date.now() + REFRESH_TTL_SEC * 1000)

    const session = await this.tx.run(async (db) => {
      const next = await db.refreshSession.create({
        data: {
          userId: params.current.userId,
          tokenHash,
          familyId: params.current.familyId,
          expiresAt,
          userAgent: params.userAgent,
          ip: params.ip,
        },
      })

      const revoked = await db.refreshSession.updateMany({
        where: {
          id: params.current.id,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
          replacedBy: next.id,
        },
      })

      if (revoked.count !== 1) {
        throw new Error(REFRESH_ROTATE_RACE)
      }

      return next
    })

    return { rawToken, session }
  }

  async revoke(sessionId: string): Promise<void> {
    await this.tx.getClient().refreshSession.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    })
  }

  async revokeFamily(familyId: string): Promise<void> {
    await this.tx.getClient().refreshSession.updateMany({
      where: { familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    })
  }

  async revokeAllForUser(userId: string, now: Date): Promise<void> {
    await this.tx.getClient().refreshSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: now },
    })
  }
}
