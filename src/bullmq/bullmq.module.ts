import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ConfigKeys } from '../config/config.interface'
import { SecretsManagerModule } from '../secrets-manager/secrets-manager.module'
import { SecretsManagerService } from '../secrets-manager/secrets-manager.service'
import { BridgeTransactionScannerWorker } from './workers/bridge-transaction-scanner.worker'
import { BridgeTransactionScannerQueue } from './queues/bridge-transaction-scanner.queue'
import { BRIDEGE_TRANSACTION_SCANNER_QUEUE, ALCHEMY_TRANSACTION_SCANNER_QUEUE, FOREX_RATE_FETCHER_QUEUE } from './constants'
import { BridgeXyzModule } from '../bridge-xyz/bridge-xyz.module'
import { AlchemyTransactionScannerQueue } from './queues/alchemy-trasnaction-scanner.queue'
import { AlchemyTransactionScannerWorker } from './workers/alchemy-transaction-scanner.worker'
import { AlchemyModule } from '../alchemy/alchemy.module'
import { UsersModule } from '../users/users.module'
import { ForexRateFetcherWorker } from './workers/forex-rate-fetcher.worker'
import { ForexRateFetcherQueue } from './queues/forex-rate-fetcher.queue'
import { ForexModule } from '../forex/forex.module'

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule, SecretsManagerModule],
      useFactory: (configService: ConfigService, secretManagerService: SecretsManagerService) => {
        const isUsingTLS = configService.get(ConfigKeys.REDIS_TLS) === 'true'
        const host = secretManagerService.getRedisHost()
        const port = secretManagerService.getRedisPort()

        if (isUsingTLS) {
          // TLS enabled means AWS ElastiCache cluster mode
          return {
            connection: {
              enableReadyCheck: false,
              redisOptions: {
                tls: {
                  rejectUnauthorized: false,
                },
              },
              host,
              port,
            },
          }
        }
        // Local development - single node mode
        return {
          connection: {
            host,
            port,
          },
        }
      },
      inject: [ConfigService, SecretsManagerService],
    }),
    BullModule.registerQueue({
      name: BRIDEGE_TRANSACTION_SCANNER_QUEUE,
    }),
    BullModule.registerQueue({
      name: ALCHEMY_TRANSACTION_SCANNER_QUEUE,
    }),
    BullModule.registerQueue({
      name: FOREX_RATE_FETCHER_QUEUE,
    }),
    AlchemyModule,
    BridgeXyzModule,
    UsersModule,
    ForexModule,
  ],
  providers: [
    BridgeTransactionScannerWorker,
    AlchemyTransactionScannerWorker,
    ForexRateFetcherWorker,
    BridgeTransactionScannerQueue,
    AlchemyTransactionScannerQueue,
    ForexRateFetcherQueue,
  ],
  exports: [BullModule, BridgeTransactionScannerQueue, AlchemyTransactionScannerQueue, ForexRateFetcherQueue],
})
export class BullmqModule {}
