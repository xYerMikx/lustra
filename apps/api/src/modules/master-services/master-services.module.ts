import { Module } from '@nestjs/common'

import { PrismaModule } from '@/common/prisma/prisma.module'
import { AuthModule } from '@/modules/auth/auth.module'
import { CatalogServicesController } from '@/modules/master-services/api/catalog-services.controller'
import { MasterServicesController } from '@/modules/master-services/api/master-services.controller'
import { CreateServiceUseCase } from '@/modules/master-services/app/create-service.usecase'
import { ListCategoriesUseCase } from '@/modules/master-services/app/list-categories.usecase'
import { ListMasterServicesUseCase } from '@/modules/master-services/app/list-master-services.usecase'
import { ListServiceTemplatesUseCase } from '@/modules/master-services/app/list-service-templates.usecase'
import { UpdateServiceUseCase } from '@/modules/master-services/app/update-service.usecase'
import { CategoryRepository } from '@/modules/master-services/infra/category.repository'
import { ServiceRepository } from '@/modules/master-services/infra/service.repository'

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [MasterServicesController, CatalogServicesController],
  providers: [
    CategoryRepository,
    ServiceRepository,
    ListCategoriesUseCase,
    ListServiceTemplatesUseCase,
    ListMasterServicesUseCase,
    CreateServiceUseCase,
    UpdateServiceUseCase,
  ],
})
export class MasterServicesModule {}
