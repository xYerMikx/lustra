import { Module } from '@nestjs/common'

import { AuthModule } from '../auth/auth.module'
import { PrismaModule } from '../../common/prisma/prisma.module'
import { CatalogDistrictsController } from './api/catalog-districts.controller'
import { MasterProfileController } from './api/master-profile.controller'
import { GetMasterProfileUseCase } from './app/get-master-profile.usecase'
import { ListDistrictsUseCase } from './app/list-districts.usecase'
import { UpdateMasterProfileUseCase } from './app/update-master-profile.usecase'
import { DistrictRepository } from './infra/district.repository'
import { MasterProfileRepository } from './infra/master-profile.repository'

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
