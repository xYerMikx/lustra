import { Module } from '@nestjs/common'

import { AuthModule } from '@/modules/auth/auth.module'
import { PrismaModule } from '@/common/prisma/prisma.module'
import { PublicMediaController } from '@/modules/master-portfolio/api/public-media.controller'
import { MasterPortfolioController } from '@/modules/master-portfolio/api/master-portfolio.controller'
import { CreatePortfolioItemUseCase } from '@/modules/master-portfolio/app/create-portfolio-item.usecase'
import { DeletePortfolioItemUseCase } from '@/modules/master-portfolio/app/delete-portfolio-item.usecase'
import { GetPublicMediaUseCase } from '@/modules/master-portfolio/app/get-public-media.usecase'
import { ListPortfolioUseCase } from '@/modules/master-portfolio/app/list-portfolio.usecase'
import { UpdatePortfolioItemUseCase } from '@/modules/master-portfolio/app/update-portfolio-item.usecase'
import { PortfolioRepository } from '@/modules/master-portfolio/infra/portfolio.repository'

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [MasterPortfolioController, PublicMediaController],
  providers: [
    PortfolioRepository,
    CreatePortfolioItemUseCase,
    ListPortfolioUseCase,
    UpdatePortfolioItemUseCase,
    DeletePortfolioItemUseCase,
    GetPublicMediaUseCase,
  ],
})
export class MasterPortfolioModule {}
