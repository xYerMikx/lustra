import { describe, expect, it, vi } from 'vitest'

import { DomainError } from '@/common/errors/domain-error'
import { GetPublicMediaUseCase } from '@/modules/master-portfolio/app/get-public-media.usecase'
import type { MediaStorage } from '@/common/storage/media-storage.port'

describe('GetPublicMediaUseCase', () => {
  it('rejects path traversal in the file name', async () => {
    const storage = { put: vi.fn(), read: vi.fn() } as unknown as MediaStorage
    const useCase = new GetPublicMediaUseCase(storage)

    await expect(
      useCase.execute('11111111-1111-4111-8111-111111111111', '../secret.webp'),
    ).rejects.toBeInstanceOf(DomainError)
    expect(storage.read).not.toHaveBeenCalled()
  })

  it('reads a valid media key', async () => {
    const storage = {
      put: vi.fn(),
      read: vi.fn().mockResolvedValue(Buffer.from('ok')),
    } as unknown as MediaStorage
    const useCase = new GetPublicMediaUseCase(storage)
    const ownerId = '11111111-1111-4111-8111-111111111111'
    const fileName = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.webp'

    const file = await useCase.execute(ownerId, fileName)

    expect(storage.read).toHaveBeenCalledWith(`${ownerId}/${fileName}`)
    expect(file.mimeType).toBe('image/webp')
  })
})
