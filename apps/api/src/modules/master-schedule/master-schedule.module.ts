import { Module } from '@nestjs/common'

import { PrismaModule } from '@/common/prisma/prisma.module'
import { AuthModule } from '@/modules/auth/auth.module'
import { MasterScheduleBlocksController } from '@/modules/master-schedule/api/master-schedule-blocks.controller'
import { MasterScheduleController } from '@/modules/master-schedule/api/master-schedule.controller'
import { CreateTimeBlockUseCase } from '@/modules/master-schedule/app/create-time-block.usecase'
import { DeleteTimeBlockUseCase } from '@/modules/master-schedule/app/delete-time-block.usecase'
import { GetMasterScheduleUseCase } from '@/modules/master-schedule/app/get-master-schedule.usecase'
import { PutMasterScheduleUseCase } from '@/modules/master-schedule/app/put-master-schedule.usecase'
import { ScheduleRepository } from '@/modules/master-schedule/infra/schedule.repository'
import { TimeBlockRepository } from '@/modules/master-schedule/infra/time-block.repository'
import { SchedulingModule } from '@/modules/scheduling/scheduling.module'

@Module({
  imports: [PrismaModule, AuthModule, SchedulingModule],
  controllers: [MasterScheduleController, MasterScheduleBlocksController],
  providers: [
    ScheduleRepository,
    TimeBlockRepository,
    GetMasterScheduleUseCase,
    PutMasterScheduleUseCase,
    CreateTimeBlockUseCase,
    DeleteTimeBlockUseCase,
  ],
})
export class MasterScheduleModule {}
