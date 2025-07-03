import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import config from '../config/config'
import { AwsModule } from '../aws/aws.module'
import { GlobalModule } from '../global.module'
import { GuardModule } from '../auth/guard.module'
import { CreatorHandlerModule } from '../creator-handler/creator-handler.module'

import { EvmTransactionEventsHandlerService } from './evm-transaction-events-handler.service'

@Module({
  providers: [EvmTransactionEventsHandlerService],
  imports: [
    ConfigModule.forRoot({ load: [config], isGlobal: true, ignoreEnvFile: true }),
    CreatorHandlerModule,
    AwsModule,
    GlobalModule,
    GuardModule,
  ],
  exports: [EvmTransactionEventsHandlerService],
})
export class EvmTransactionEventsHandlerModule {}
