import { Module } from '@nestjs/common'

import { ContractsResolverService } from './contractsResolver.service'

@Module({
  providers: [ContractsResolverService],
  exports: [ContractsResolverService],
})
export class ContractsResolverModule {}
