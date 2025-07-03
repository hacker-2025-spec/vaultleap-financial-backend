import { Module } from '@nestjs/common'

import { LiquidationAddressesService } from './liquidation-addresses.service'
import { AwsModule } from '../aws/aws.module'
import { LiquidationAddressesController } from './liquidation-addresses.controller'
import { SecretsManagerModule } from '../secrets-manager/secrets-manager.module'
import { AlchemyModule } from '../alchemy/alchemy.module'

@Module({
  providers: [LiquidationAddressesService],
  imports: [AwsModule, SecretsManagerModule, AlchemyModule],
  exports: [LiquidationAddressesService],
  controllers: [LiquidationAddressesController],
})
export class LiquidationAddressesModule {}
