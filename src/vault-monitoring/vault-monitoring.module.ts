import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import config from '../config/config'
import { AwsModule } from '../aws/aws.module'
import { GlobalModule } from '../global.module'
import { VaultModule } from '../vault/vault.module'
import { EthRpcModule } from '../eth-rpc/eth-rpc.module'
import { EmailSenderModule } from '../email-sender/email-sender.module'

import { VaultMonitoringService } from './vault-monitoring.service'

@Module({
  imports: [
    ConfigModule.forRoot({ load: [config], isGlobal: true, ignoreEnvFile: true }),
    AwsModule,
    GlobalModule,
    VaultModule,
    EthRpcModule,
    EmailSenderModule,
  ],
  providers: [VaultMonitoringService],
})
export class VaultMonitoringModule {}
