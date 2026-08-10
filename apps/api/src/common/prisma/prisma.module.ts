import { Global, Module } from '@nestjs/common'

import { PrismaService } from './prisma.service'
import { TransactionManager } from './transaction-manager.service'

@Global()
@Module({
  providers: [PrismaService, TransactionManager],
  exports: [PrismaService, TransactionManager],
})
export class PrismaModule {}
