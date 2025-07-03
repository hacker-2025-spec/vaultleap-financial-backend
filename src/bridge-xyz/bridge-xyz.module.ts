import { forwardRef, Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'

import { DirectVaultsModule } from '../direct-vaults/direct-vaults.module'
import { VirtualAccountsModule } from '../virtual-accounts/virtual-accounts.module'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { SecretsManagerService } from '../secrets-manager/secrets-manager.service'
import { ConfigKeys } from '../config/config.interface'
import { BridgeXyzSyncService } from './services/bridge-xyz.sync.service'
import { SecretsManagerModule } from '../secrets-manager/secrets-manager.module'
import { CustomersService } from '../customers/customers.service'
import { RedisModule } from '../redis/redis.module'
import { BridgeXyzService } from './bridge-xyz.service'
import { TransactionItemModule } from '../transaction-items/transaction-item.module'

@Module({
  imports: [
    RedisModule,
    HttpModule.registerAsync({
      imports: [ConfigModule, SecretsManagerModule],
      inject: [ConfigService, SecretsManagerService],
      useFactory: (configService: ConfigService, secretManagerService: SecretsManagerService) => ({
        baseURL: configService.getOrThrow<string>(ConfigKeys.BRIDGE_URL),
        headers: {
          'Api-Key': secretManagerService.getBridgeApiKey(),
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }),
    }),
    forwardRef(() => DirectVaultsModule),
    forwardRef(() => VirtualAccountsModule),
    SecretsManagerModule,
    TransactionItemModule,
  ],
  providers: [BridgeXyzService, BridgeXyzSyncService, CustomersService],
  exports: [BridgeXyzService, BridgeXyzSyncService],
})
export class BridgeXyzModule {}
