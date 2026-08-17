import { Module } from '@nestjs/common'

import { PrismaModule } from '@/common/prisma/prisma.module'
import { AuthModule } from '@/modules/auth/auth.module'
import { MasterCalendarController } from '@/modules/master-calendar/api/master-calendar.controller'
import { GetMasterCalendarUseCase } from '@/modules/master-calendar/app/get-master-calendar.usecase'
import { MasterCalendarRepository } from '@/modules/master-calendar/infra/master-calendar.repository'
import { SchedulingModule } from '@/modules/scheduling/scheduling.module'

@Module({
  imports: [PrismaModule, AuthModule, SchedulingModule],
  controllers: [MasterCalendarController],
  providers: [MasterCalendarRepository, GetMasterCalendarUseCase],
})
export class MasterCalendarModule {}
