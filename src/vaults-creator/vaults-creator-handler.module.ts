import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import config from '../config/config'
import { AwsModule } from '../aws/aws.module'
import { GlobalModule } from '../global.module'
import { VaultModule } from '../vault/vault.module'
import { TaxInfoModule } from '../tax-info/tax-info.module'
import { CreatorHandlerModule } from '../creator-handler/creator-handler.module'

import { VaultsCreatorService } from './vaults-creator.service'

@Module({
  imports: [
    ConfigModule.forRoot({ load: [config], isGlobal: true, ignoreEnvFile: true }),
    AwsModule,
    GlobalModule,
    VaultModule,
    TaxInfoModule,
    CreatorHandlerModule,
  ],
  providers: [VaultsCreatorService],
})
export class VaultsCreatorHandlerModule {}
