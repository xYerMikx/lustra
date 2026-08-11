import { Module } from '@nestjs/common'

import { PrismaModule } from '@/common/prisma/prisma.module'
import { CatalogAvailabilityController } from '@/modules/scheduling/api/catalog-availability.controller'
import { EnsureSlotsUseCase } from '@/modules/scheduling/app/ensure-slots.usecase'
import { GetAvailabilityUseCase } from '@/modules/scheduling/app/get-availability.usecase'
import { SchedulingRepository } from '@/modules/scheduling/infra/scheduling.repository'

@Module({
  imports: [PrismaModule],
  controllers: [CatalogAvailabilityController],
  providers: [
    SchedulingRepository,
    EnsureSlotsUseCase,
    GetAvailabilityUseCase,
  ],
  exports: [EnsureSlotsUseCase, SchedulingRepository],
})
export class SchedulingModule {}
