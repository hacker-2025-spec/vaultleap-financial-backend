import { Module } from '@nestjs/common'

import { AwsModule } from '../aws/aws.module'

import { EvmTransactionSenderService } from './evm-transaction-sender.service'
import { EvmTransactionSenderController } from './evm-transaction-sender.controller'

@Module({
  providers: [EvmTransactionSenderService],
  imports: [AwsModule],
  exports: [EvmTransactionSenderService],
  controllers: [EvmTransactionSenderController],
})
export class EvmTransactionSenderModule {}
