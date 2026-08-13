import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import type { S3Client } from '@aws-sdk/client-s3'
import { Inject, Injectable } from '@nestjs/common'

import { assertStorageKey } from '@/common/storage/assert-storage-key'
import {
  S3_CLIENT,
  STORAGE_BUCKET,
  type MediaStorage,
} from '@/common/storage/media-storage.port'

type S3Sender = Pick<S3Client, 'send'>

@Injectable()
export class S3MediaStorage implements MediaStorage {
  constructor(
    @Inject(S3_CLIENT) private readonly client: S3Sender,
    @Inject(STORAGE_BUCKET) private readonly bucket: string,
  ) {}

  async put(
    storageKey: string,
    bytes: Buffer,
    contentType?: string,
  ): Promise<void> {
    const key = assertStorageKey(storageKey)

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: bytes,
        ContentType: contentType,
      }),
    )
  }

  async read(storageKey: string): Promise<Buffer | null> {
    const key = assertStorageKey(storageKey)

    try {
      const response = await this.client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      )

      if (!response.Body) {
        return null
      }

      return Buffer.from(await response.Body.transformToByteArray())
    } catch (error) {
      if (isMissingObject(error)) {
        return null
      }

      throw error
    }
  }
}

function isMissingObject(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false
  }

  const candidate = error as {
    name?: string
    $metadata?: { httpStatusCode?: number }
  }

  return (
    candidate.$metadata?.httpStatusCode === 404 ||
    candidate.name === 'NoSuchKey' ||
    candidate.name === 'NotFound'
  )
}
