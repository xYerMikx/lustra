import { Module } from '@nestjs/common'

import { PrismaModule } from '@/common/prisma/prisma.module'
import { AuthModule } from '@/modules/auth/auth.module'
import { MasterScheduleBlocksController } from '@/modules/master-schedule/api/master-schedule-blocks.controller'
import { MasterScheduleExceptionsController } from '@/modules/master-schedule/api/master-schedule-exceptions.controller'
import { MasterScheduleController } from '@/modules/master-schedule/api/master-schedule.controller'
import { CreateTimeBlockUseCase } from '@/modules/master-schedule/app/create-time-block.usecase'
import { DeleteScheduleExceptionUseCase } from '@/modules/master-schedule/app/delete-schedule-exception.usecase'
import { DeleteTimeBlockUseCase } from '@/modules/master-schedule/app/delete-time-block.usecase'
import { GetMasterScheduleUseCase } from '@/modules/master-schedule/app/get-master-schedule.usecase'
import { ListScheduleExceptionsUseCase } from '@/modules/master-schedule/app/list-schedule-exceptions.usecase'
import { PutMasterScheduleUseCase } from '@/modules/master-schedule/app/put-master-schedule.usecase'
import { PutScheduleExceptionUseCase } from '@/modules/master-schedule/app/put-schedule-exception.usecase'
import { ScheduleExceptionRepository } from '@/modules/master-schedule/infra/schedule-exception.repository'
import { ScheduleRepository } from '@/modules/master-schedule/infra/schedule.repository'
import { TimeBlockRepository } from '@/modules/master-schedule/infra/time-block.repository'
import { SchedulingModule } from '@/modules/scheduling/scheduling.module'

@Module({
  imports: [PrismaModule, AuthModule, SchedulingModule],
  controllers: [
    MasterScheduleController,
    MasterScheduleBlocksController,
    MasterScheduleExceptionsController,
  ],
  providers: [
    ScheduleRepository,
    TimeBlockRepository,
    ScheduleExceptionRepository,
    GetMasterScheduleUseCase,
    PutMasterScheduleUseCase,
    CreateTimeBlockUseCase,
    DeleteTimeBlockUseCase,
    ListScheduleExceptionsUseCase,
    PutScheduleExceptionUseCase,
    DeleteScheduleExceptionUseCase,
  ],
})
export class MasterScheduleModule {}
