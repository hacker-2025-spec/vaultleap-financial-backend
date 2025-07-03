import { Module } from '@nestjs/common'

import { AwsModule } from '../aws/aws.module'
import { VaultModule } from '../vault/vault.module'
import { TaxInfoModule } from '../tax-info/tax-info.module'
import { CreatorHandlerModule } from '../creator-handler/creator-handler.module'

import { VaultsCreatorService } from './vaults-creator.service'
import { VaultsCreatorController } from './vaults-creator.controller'

@Module({
  imports: [AwsModule, VaultModule, TaxInfoModule, CreatorHandlerModule],
  controllers: [VaultsCreatorController],
  providers: [VaultsCreatorService],
  exports: [VaultsCreatorService],
})
export class VaultsCreatorModule {}
