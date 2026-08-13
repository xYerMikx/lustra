import { S3Client } from '@aws-sdk/client-s3'

export function readStorageBucket(): string {
  const bucket = process.env.STORAGE_BUCKET?.trim()

  if (!bucket) {
    throw new Error('STORAGE_BUCKET is required')
  }

  return bucket
}

export function createS3ClientFromEnv(): S3Client {
  const accessKeyId = process.env.STORAGE_KEY?.trim()
  const secretAccessKey = process.env.STORAGE_SECRET?.trim()

  if (!accessKeyId || !secretAccessKey) {
    throw new Error('STORAGE_KEY and STORAGE_SECRET are required')
  }

  const endpoint = process.env.STORAGE_ENDPOINT?.trim()

  return new S3Client({
    region: process.env.STORAGE_REGION?.trim() || 'us-east-1',
    endpoint: endpoint || undefined,
    forcePathStyle: Boolean(endpoint),
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  })
}
