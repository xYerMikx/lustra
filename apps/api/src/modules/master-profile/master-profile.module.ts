import { Module } from '@nestjs/common'

import { PrismaModule } from '@/common/prisma/prisma.module'
import { AuthModule } from '@/modules/auth/auth.module'
import { CatalogDistrictsController } from '@/modules/master-profile/api/catalog-districts.controller'
import { CatalogMastersController } from '@/modules/master-profile/api/catalog-masters.controller'
import { MasterProfileController } from '@/modules/master-profile/api/master-profile.controller'
import { GetMasterProfileUseCase } from '@/modules/master-profile/app/get-master-profile.usecase'
import { GetPublicMasterBySlugUseCase } from '@/modules/master-profile/app/get-public-master-by-slug.usecase'
import { ListDistrictsUseCase } from '@/modules/master-profile/app/list-districts.usecase'
import { UpdateMasterProfileUseCase } from '@/modules/master-profile/app/update-master-profile.usecase'
import { DistrictRepository } from '@/modules/master-profile/infra/district.repository'
import { MasterProfileRepository } from '@/modules/master-profile/infra/master-profile.repository'
import { PublicMasterRepository } from '@/modules/master-profile/infra/public-master.repository'

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [
    MasterProfileController,
    CatalogDistrictsController,
    CatalogMastersController,
  ],
  providers: [
    MasterProfileRepository,
    PublicMasterRepository,
    DistrictRepository,
    GetMasterProfileUseCase,
    GetPublicMasterBySlugUseCase,
    UpdateMasterProfileUseCase,
    ListDistrictsUseCase,
  ],
})
export class MasterProfileModule {}
