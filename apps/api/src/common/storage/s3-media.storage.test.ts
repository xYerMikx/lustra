import { describe, expect, it, vi } from 'vitest'

import { S3MediaStorage } from '@/common/storage/s3-media.storage'

describe('S3MediaStorage', () => {
  it('puts bytes under a validated key', async () => {
    const send = vi.fn().mockResolvedValue({})
    const storage = new S3MediaStorage({ send }, 'lumira-media')

    await storage.put('owner/a.webp', Buffer.from('ok'), 'image/webp')

    expect(send).toHaveBeenCalledOnce()
    const command = send.mock.calls[0]?.[0] as {
      input: { Bucket: string; Key: string; ContentType?: string }
    }
    expect(command.input.Bucket).toBe('lumira-media')
    expect(command.input.Key).toBe('owner/a.webp')
    expect(command.input.ContentType).toBe('image/webp')
  })

  it('returns null when the object is missing', async () => {
    const send = vi.fn().mockRejectedValue({
      name: 'NoSuchKey',
      $metadata: { httpStatusCode: 404 },
    })
    const storage = new S3MediaStorage({ send }, 'lumira-media')

    await expect(storage.read('owner/a.webp')).resolves.toBeNull()
  })
})
