import type { INestApplication } from '@nestjs/common'
import type { ExpressAdapter } from '@nestjs/platform-express'
import { createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { ExpressAdapter as BullBoardExpressAdapter } from '@bull-board/express'
import type { ConnectionOptions } from 'bullmq'
import { Queue } from 'bullmq'
import basicAuth from 'express-basic-auth'
import { SUPPORT_TICKET_QUEUE } from '../support-ticket/queue/email-queue.constants'
import { SecretsManagerService } from '../secrets-manager/secrets-manager.service'
import { ConfigService } from '@nestjs/config'
import { ConfigKeys } from '../config/config.interface'
import { ALCHEMY_TRANSACTION_SCANNER_QUEUE, BRIDEGE_TRANSACTION_SCANNER_QUEUE } from '../bullmq/constants'

export function setupBullBoard(app: INestApplication) {
  const adapter = app.getHttpAdapter() as ExpressAdapter
  const express = adapter.getInstance()

  const secretManagerService = app.get<SecretsManagerService>(SecretsManagerService)

  const configService = app.get<ConfigService>(ConfigService)

  const useTLS = configService.get(ConfigKeys.REDIS_TLS) === 'true'

  const redisConnection: ConnectionOptions = {
    host: secretManagerService.getRedisHost(),
    port: secretManagerService.getRedisPort(),
    ...(useTLS
      ? {
          tls: {
            rejectUnauthorized: false,
          },
          enableReadyCheck: false,
          maxRetriesPerRequest: 3,
        }
      : {}),
  }

  const emailQueue = new Queue(SUPPORT_TICKET_QUEUE, {
    connection: redisConnection,
  })

  const bridgeTransactionScannerQueue = new Queue(BRIDEGE_TRANSACTION_SCANNER_QUEUE, {
    connection: redisConnection,
  })

  const alchemyTransactionScannerQueue = new Queue(ALCHEMY_TRANSACTION_SCANNER_QUEUE, {
    connection: redisConnection,
  })

  const serverAdapter = new BullBoardExpressAdapter()
  serverAdapter.setBasePath('/admin/queues')

  createBullBoard({
    queues: [
      new BullMQAdapter(emailQueue),
      new BullMQAdapter(bridgeTransactionScannerQueue),
      new BullMQAdapter(alchemyTransactionScannerQueue),
    ],
    serverAdapter,
  })

  express.use(
    '/admin/queues',
    basicAuth({
      users: {
        [secretManagerService.getBullBoardUsername()]: secretManagerService.getBullBoardPassword(),
      },
      challenge: true,
    }),
    serverAdapter.getRouter()
  )
}
