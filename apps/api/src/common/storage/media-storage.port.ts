export type MediaStorage = {
  put(storageKey: string, bytes: Buffer, contentType?: string): Promise<void>
  read(storageKey: string): Promise<Buffer | null>
}

export const MEDIA_STORAGE = Symbol('MEDIA_STORAGE')
export const S3_CLIENT = Symbol('S3_CLIENT')
export const STORAGE_BUCKET = Symbol('STORAGE_BUCKET')
