import { Global, Module } from '@nestjs/common'

import { createS3ClientFromEnv, readStorageBucket } from '@/common/storage/create-s3-client'
import {
  MEDIA_STORAGE,
  S3_CLIENT,
  STORAGE_BUCKET,
} from '@/common/storage/media-storage.port'
import { S3MediaStorage } from '@/common/storage/s3-media.storage'

@Global()
@Module({
  providers: [
    {
      provide: S3_CLIENT,
      useFactory: createS3ClientFromEnv,
    },
    {
      provide: STORAGE_BUCKET,
      useFactory: readStorageBucket,
    },
    S3MediaStorage,
    {
      provide: MEDIA_STORAGE,
      useExisting: S3MediaStorage,
    },
  ],
  exports: [MEDIA_STORAGE],
})
export class StorageModule {}
