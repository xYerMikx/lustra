import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common'
import {
  AvailabilityQuerySchema,
  type AvailabilityQuery,
} from '@lumira/contracts'

import { ZodValidationPipe } from '@/common/auth/zod-validation.pipe'
import { GetAvailabilityUseCase } from '@/modules/scheduling/app/get-availability.usecase'

@Controller('catalog/masters')
export class CatalogAvailabilityController {
  constructor(private readonly getAvailability: GetAvailabilityUseCase) {}

  @Get(':masterId/availability')
  availability(
    @Param('masterId', ParseUUIDPipe) masterId: string,
    @Query(new ZodValidationPipe(AvailabilityQuerySchema))
    query: AvailabilityQuery,
  ) {
    return this.getAvailability.execute(masterId, query)
  }
}
