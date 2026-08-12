import { describe, expect, it, vi } from 'vitest'
import { Prisma } from '@lustra/db'

import { DomainError } from '@/common/errors/domain-error'
import type {
  CategoryStore,
  ServiceStore,
} from '@/modules/master-services/app/master-services.ports'
import { CreateServiceUseCase } from '@/modules/master-services/app/create-service.usecase'
import { UpdateServiceUseCase } from '@/modules/master-services/app/update-service.usecase'
import type { ServiceRecord } from '@/modules/master-services/domain/map-service'

const actor = { id: 'u1', role: 'master' as const, email: 'm@example.com' }

function buildServiceRecord(overrides: Partial<ServiceRecord> = {}): ServiceRecord {
  return {
    id: 'svc-1',
    masterId: 'm1',
    categoryId: 'cat-1',
    title: 'Маникюр комбинированный',
    description: null,
    durationMin: 90,
    bufferAfterMin: 0,
    price: new Prisma.Decimal(60),
    priceMax: null,
    priceType: 'fixed',
    currency: 'BYN',
    isActive: true,
    sort: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    category: { id: 'cat-1', name: 'Ногти', slug: 'nogti' },
    ...overrides,
  }
}

describe('CreateServiceUseCase', () => {
  it('creates a service for the JWT master profile', async () => {
    const services: ServiceStore = {
      findMasterIdByUserId: vi.fn().mockResolvedValue('m1'),
      listByMasterId: vi.fn(),
      findById: vi.fn(),
      create: vi.fn().mockResolvedValue(buildServiceRecord()),
      update: vi.fn(),
    }
    const categories: CategoryStore = {
      listAll: vi.fn(),
      findById: vi.fn().mockResolvedValue({ id: 'cat-1', slug: 'nogti' }),
      findBySlug: vi.fn(),
    }

    const useCase = new CreateServiceUseCase(services, categories)

    const result = await useCase.execute(actor, {
      categoryId: 'cat-1',
      title: 'Маникюр комбинированный',
      durationMin: 90,
      price: 60,
    })

    expect(result.title).toBe('Маникюр комбинированный')
    expect(result.price).toBe(60)
    expect(services.create).toHaveBeenCalledWith(
      'm1',
      expect.objectContaining({
        categoryId: 'cat-1',
        title: 'Маникюр комбинированный',
        durationMin: 90,
      }),
    )
  })

  it('rejects unknown category', async () => {
    const services: ServiceStore = {
      findMasterIdByUserId: vi.fn().mockResolvedValue('m1'),
      listByMasterId: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    }
    const categories: CategoryStore = {
      listAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(null),
      findBySlug: vi.fn(),
    }

    const useCase = new CreateServiceUseCase(services, categories)

    await expect(
      useCase.execute(actor, {
        categoryId: '00000000-0000-4000-8000-000000000099',
        title: 'X',
        durationMin: 60,
        price: 10,
      }),
    ).rejects.toMatchObject({ code: 'VALIDATION_FAILED' } satisfies Partial<DomainError>)

    expect(services.create).not.toHaveBeenCalled()
  })
})

describe('UpdateServiceUseCase', () => {
  it('rejects update when service belongs to another master', async () => {
    const services: ServiceStore = {
      findMasterIdByUserId: vi.fn().mockResolvedValue('m1'),
      listByMasterId: vi.fn(),
      findById: vi.fn().mockResolvedValue(
        buildServiceRecord({ masterId: 'other-master' }),
      ),
      create: vi.fn(),
      update: vi.fn(),
    }
    const categories: CategoryStore = {
      listAll: vi.fn(),
      findById: vi.fn(),
      findBySlug: vi.fn(),
    }

    const useCase = new UpdateServiceUseCase(services, categories)

    await expect(
      useCase.execute(actor, 'svc-1', { title: 'Чужая услуга' }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' } satisfies Partial<DomainError>)

    expect(services.update).not.toHaveBeenCalled()
  })

  it('updates owned service', async () => {
    const services: ServiceStore = {
      findMasterIdByUserId: vi.fn().mockResolvedValue('m1'),
      listByMasterId: vi.fn(),
      findById: vi.fn().mockResolvedValue(buildServiceRecord()),
      create: vi.fn(),
      update: vi.fn().mockResolvedValue(
        buildServiceRecord({ title: 'Маникюр обновлённый' }),
      ),
    }
    const categories: CategoryStore = {
      listAll: vi.fn(),
      findById: vi.fn(),
      findBySlug: vi.fn(),
    }

    const useCase = new UpdateServiceUseCase(services, categories)

    const result = await useCase.execute(actor, 'svc-1', {
      title: 'Маникюр обновлённый',
    })

    expect(result.title).toBe('Маникюр обновлённый')
    expect(services.update).toHaveBeenCalledWith(
      'svc-1',
      'm1',
      expect.objectContaining({ title: 'Маникюр обновлённый' }),
    )
  })
})
