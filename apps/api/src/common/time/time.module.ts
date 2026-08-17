import { Global, Module } from '@nestjs/common'

import { ClockService } from '@/common/time/clock.service'

@Global()
@Module({
  providers: [ClockService],
  exports: [ClockService],
})
export class TimeModule {}
