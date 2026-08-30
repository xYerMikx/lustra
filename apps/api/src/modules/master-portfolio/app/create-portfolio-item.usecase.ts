import { randomUUID } from 'node:crypto'

import { Inject, Injectable } from '@nestjs/common'
import {
  PORTFOLIO_MAX_BYTES,
  PORTFOLIO_MAX_ITEMS,
  type CreatePortfolioQuery,
  type PortfolioItemView,
} from '@lumira/contracts'

import type { AuthUser } from '@/common/auth/auth-user'
import { DomainError } from '@/common/errors/domain-error'
import { TransactionManager } from '@/common/prisma/transaction-manager.service'
import {
  MEDIA_STORAGE,
  type MediaStorage,
} from '@/common/storage/media-storage.port'
import { toPortfolioItemView } from '@/modules/master-portfolio/domain/map-portfolio-item'
import { sniffImage } from '@/modules/master-portfolio/domain/sniff-image'
import { PortfolioRepository } from '@/modules/master-portfolio/infra/portfolio.repository'

@Injectable()
export class CreatePortfolioItemUseCase {
  constructor(
    private readonly portfolio: PortfolioRepository,
    @Inject(MEDIA_STORAGE)
    private readonly storage: MediaStorage,
    private readonly tx: TransactionManager,
  ) {}

  async execute(
    currentUser: AuthUser,
    bytes: Buffer,
    query: CreatePortfolioQuery,
  ): Promise<PortfolioItemView> {
    if (currentUser.role !== 'master') {
      throw new DomainError('FORBIDDEN', 'Недостаточно прав')
    }

    if (bytes.length === 0) {
      throw new DomainError('VALIDATION_FAILED', 'Файл пустой', {
        fieldErrors: { file: ['Выберите фото'] },
      })
    }

    if (bytes.length > PORTFOLIO_MAX_BYTES) {
      throw new DomainError('LIMIT_EXCEEDED', 'Файл больше 8 МБ', {
        fieldErrors: { file: ['Максимум 8 МБ'] },
      })
    }

    const image = sniffImage(bytes)
    const masterId = await this.portfolio.findMasterIdByUserId(currentUser.id)

    if (!masterId) {
      throw new DomainError('NOT_FOUND', 'Профиль мастера не найден')
    }

    const count = await this.portfolio.countActive(masterId)

    if (count >= PORTFOLIO_MAX_ITEMS) {
      throw new DomainError('LIMIT_EXCEEDED', 'Можно загрузить до 60 фото')
    }

    if (query.serviceId) {
      const owned = await this.portfolio.serviceBelongsToMaster(
        masterId,
        query.serviceId,
      )

      if (!owned) {
        throw new DomainError('VALIDATION_FAILED', 'Услуга не найдена', {
          fieldErrors: { serviceId: ['Выберите свою услугу'] },
        })
      }
    }

    const assetId = randomUUID()
    const storageKey = `${currentUser.id}/${assetId}.${image.extension}`
    await this.storage.put(storageKey, bytes, image.mimeType)

    const created = await this.tx.run(() =>
      this.portfolio.createItem(
        {
          ownerUserId: currentUser.id,
          storageKey,
          mimeType: image.mimeType,
          bytes: bytes.length,
          width: image.width,
          height: image.height,
        },
        {
          masterId,
          serviceId: query.serviceId ?? null,
          caption: query.caption ?? null,
          sort: count,
          isCover: count === 0,
        },
      ),
    )

    return toPortfolioItemView(created)
  }
}
