import { Module } from '@nestjs/common'

import { EthRpcModule } from '../eth-rpc/eth-rpc.module'

import { PaymasterService } from './paymaster.service'
import { PaymasterController } from './paymaster.controller'

@Module({
  providers: [PaymasterService],
  imports: [EthRpcModule],
  controllers: [PaymasterController],
})
export class PaymasterModule {}
