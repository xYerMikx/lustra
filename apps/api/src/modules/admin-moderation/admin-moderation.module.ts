import { Module } from '@nestjs/common'

import { AdminGuard } from '@/common/auth/admin.guard'
import { AdminIpAllowlistGuard } from '@/common/auth/admin-ip-allowlist.guard'
import { PrismaModule } from '@/common/prisma/prisma.module'
import { AuthModule } from '@/modules/auth/auth.module'
import { AdminMastersController } from '@/modules/admin-moderation/api/admin-masters.controller'
import { ListAdminMastersUseCase } from '@/modules/admin-moderation/app/list-admin-masters.usecase'
import { ModerateMasterUseCase } from '@/modules/admin-moderation/app/moderate-master.usecase'
import { AdminModerationRepository } from '@/modules/admin-moderation/infra/admin-moderation.repository'

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AdminMastersController],
  providers: [
    AdminGuard,
    AdminIpAllowlistGuard,
    AdminModerationRepository,
    ListAdminMastersUseCase,
    ModerateMasterUseCase,
  ],
})
export class AdminModerationModule {}
