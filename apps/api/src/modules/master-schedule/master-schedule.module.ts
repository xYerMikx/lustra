import { Module } from '@nestjs/common'

import { PrismaModule } from '@/common/prisma/prisma.module'
import { AuthModule } from '@/modules/auth/auth.module'
import { MasterScheduleController } from '@/modules/master-schedule/api/master-schedule.controller'
import { GetMasterScheduleUseCase } from '@/modules/master-schedule/app/get-master-schedule.usecase'
import { PutMasterScheduleUseCase } from '@/modules/master-schedule/app/put-master-schedule.usecase'
import { ScheduleRepository } from '@/modules/master-schedule/infra/schedule.repository'

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [MasterScheduleController],
  providers: [
    ScheduleRepository,
    GetMasterScheduleUseCase,
    PutMasterScheduleUseCase,
  ],
})
export class MasterScheduleModule {}
