import { Client, fetchExchange } from 'urql'

import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { type DeployedChain, getDeployments } from '@KLYDO-io/getrewards-contracts'

import { ConfigKeys } from '../config/config.interface'
import { EthRpcModule } from '../eth-rpc/eth-rpc.module'

import { VaultService } from './vault.service'
import { VaultController } from './vault.controller'
import { ShareholdersClaimAccountsModule } from '../shareholders-claim-accounts/shareholders-claim-accounts.module'
import { SumSubModule } from '../sum-sub/sum-sub.module'
import { PersonaModule } from '../persona/persona.module'
import { AlchemyModule } from '../alchemy/alchemy.module'
import { AddressActivityModule } from '../address-activity/address-activity.module'

@Module({
  providers: [
    VaultService,
    {
      useFactory: (configService: ConfigService) => getDeployments(Number(configService.get(ConfigKeys.CHAIN_ID)!) as DeployedChain),
      provide: 'Deployments',
      inject: [ConfigService],
    },
    {
      useFactory: (configService: ConfigService) =>
        new Client({
          url: configService.get<string>(ConfigKeys.GRAPHQL_API_URL, ''),
          exchanges: [fetchExchange],
        }),
      provide: Client,
      inject: [ConfigService],
    },
  ],
  imports: [EthRpcModule, ShareholdersClaimAccountsModule, SumSubModule, PersonaModule, AlchemyModule, AddressActivityModule],
  exports: [VaultService],
  controllers: [VaultController],
})
export class VaultModule {}
