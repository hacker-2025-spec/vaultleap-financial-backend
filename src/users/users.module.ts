import { Module } from '@nestjs/common'

import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { AwsModule } from '../aws/aws.module'
import { CustomersModule } from '../customers/customers.module'
import { BridgeKYCModule } from '../bridge-kyc/bridge-kyc.module'
import { AlchemyModule } from '../alchemy/alchemy.module'

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [AwsModule, CustomersModule, BridgeKYCModule, AlchemyModule],
  exports: [UsersService],
})
export class UsersModule {}
