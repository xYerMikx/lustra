import { Inject, Injectable } from '@nestjs/common'

import { DomainError } from '@/common/errors/domain-error'
import {
  MEDIA_STORAGE,
  type MediaStorage,
} from '@/common/storage/media-storage.port'

const FILE_NAME_RE = /^[0-9a-f-]{36}\.(webp|jpg|png)$/i
const OWNER_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export type PublicMediaFile = {
  bytes: Buffer
  mimeType: string
}

@Injectable()
export class GetPublicMediaUseCase {
  constructor(
    @Inject(MEDIA_STORAGE)
    private readonly storage: MediaStorage,
  ) {}

  async execute(ownerId: string, fileName: string): Promise<PublicMediaFile> {
    if (!OWNER_RE.test(ownerId) || !FILE_NAME_RE.test(fileName)) {
      throw new DomainError('NOT_FOUND', 'Файл не найден')
    }

    const storageKey = `${ownerId}/${fileName}`
    const bytes = await this.storage.read(storageKey)

    if (!bytes) {
      throw new DomainError('NOT_FOUND', 'Файл не найден')
    }

    return {
      bytes,
      mimeType: mimeFromName(fileName),
    }
  }
}

function mimeFromName(fileName: string): string {
  if (fileName.endsWith('.png')) {
    return 'image/png'
  }

  if (fileName.endsWith('.jpg')) {
    return 'image/jpeg'
  }

  return 'image/webp'
}
