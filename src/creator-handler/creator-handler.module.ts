import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { type DeployedChain, getDeployments } from '@KLYDO-io/getrewards-contracts'

import { AwsModule } from '../aws/aws.module'
import { VaultModule } from '../vault/vault.module'
import { ConfigKeys } from '../config/config.interface'
import { EthRpcModule } from '../eth-rpc/eth-rpc.module'
import { EmailSenderModule } from '../email-sender/email-sender.module'
import { ContractsResolverModule } from '../contractsResolver/contractsResolver.module'
import { EvmTransactionSenderModule } from '../evm-transaction-sender/evm-transaction-sender.module'
import { ShareholdersClaimAccountsModule } from '../shareholders-claim-accounts/shareholders-claim-accounts.module'

import { CreatorHandlerService } from './creator-handler.service'
import { CreatorHandlerController } from './creator-handler.controller'
import { AlchemyModule } from '../alchemy/alchemy.module'

@Module({
  providers: [
    CreatorHandlerService,
    {
      useFactory: (configService: ConfigService) => getDeployments(Number(configService.get(ConfigKeys.CHAIN_ID)!) as DeployedChain),
      provide: 'Deployments',
      inject: [ConfigService],
    },
  ],
  imports: [
    AwsModule,
    VaultModule,
    EmailSenderModule,
    EthRpcModule,
    EvmTransactionSenderModule,
    ShareholdersClaimAccountsModule,
    ContractsResolverModule,
    AlchemyModule,
  ],
  exports: [CreatorHandlerService],
  controllers: [CreatorHandlerController],
})
export class CreatorHandlerModule {}
