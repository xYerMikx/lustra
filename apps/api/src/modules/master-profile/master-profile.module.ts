import { Module } from '@nestjs/common'

import { PrismaModule } from '@/common/prisma/prisma.module'
import { AuthModule } from '@/modules/auth/auth.module'
import { CatalogDistrictsController } from '@/modules/master-profile/api/catalog-districts.controller'
import { MasterProfileController } from '@/modules/master-profile/api/master-profile.controller'
import { GetMasterProfileUseCase } from '@/modules/master-profile/app/get-master-profile.usecase'
import { ListDistrictsUseCase } from '@/modules/master-profile/app/list-districts.usecase'
import { UpdateMasterProfileUseCase } from '@/modules/master-profile/app/update-master-profile.usecase'
import { DistrictRepository } from '@/modules/master-profile/infra/district.repository'
import { MasterProfileRepository } from '@/modules/master-profile/infra/master-profile.repository'

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [MasterProfileController, CatalogDistrictsController],
  providers: [
    MasterProfileRepository,
    DistrictRepository,
    GetMasterProfileUseCase,
    UpdateMasterProfileUseCase,
    ListDistrictsUseCase,
  ],
})
export class MasterProfileModule {}
