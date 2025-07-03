import { JsonRpcProvider } from 'ethers'

import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { type DeployedChain, getDeployments } from '@KLYDO-io/getrewards-contracts'

import type { IConfig } from '../config/config.interface'
import { ConfigKeys } from '../config/config.interface'

import { EthRpcService } from './eth-rpc.service'

@Module({
  providers: [
    EthRpcService,
    {
      useFactory: (configService: ConfigService<IConfig, true>) => {
        const jsonRpcUrl = configService.get('JSON_RPC_URL', { infer: true })

        const provider = new JsonRpcProvider(jsonRpcUrl, Number(configService.get(ConfigKeys.CHAIN_ID)), { batchMaxCount: 1 })

        return provider
      },
      provide: JsonRpcProvider,
      inject: [ConfigService],
    },
    {
      useFactory: (configService: ConfigService) => getDeployments(Number(configService.get(ConfigKeys.CHAIN_ID)!) as DeployedChain),
      provide: 'Deployments',
      inject: [ConfigService],
    },
  ],
  exports: [EthRpcService, JsonRpcProvider, 'Deployments'],
})
export class EthRpcModule {}
