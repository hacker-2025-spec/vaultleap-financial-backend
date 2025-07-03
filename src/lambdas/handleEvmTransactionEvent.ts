import type { Handler, SQSEvent } from 'aws-lambda'

import { NestFactory } from '@nestjs/core'

import { EvmTransactionEventsHandlerModule } from '../evm-transaction-events-handler/evm-transaction-events-handler.module'
import { EvmTransactionEventsHandlerService } from '../evm-transaction-events-handler/evm-transaction-events-handler.service'

let evmTransactionEventsHandlerService: EvmTransactionEventsHandlerService

async function initializeEvmTransactionEventsHandlerService(): Promise<EvmTransactionEventsHandlerService> {
  if (!evmTransactionEventsHandlerService) {
    const evmTransactionEventsHandlerModuleApp = await NestFactory.createApplicationContext(EvmTransactionEventsHandlerModule, {
      abortOnError: true,
    })
    // eslint-disable-next-line require-atomic-updates
    evmTransactionEventsHandlerService = evmTransactionEventsHandlerModuleApp.get(EvmTransactionEventsHandlerService)
  }

  return evmTransactionEventsHandlerService
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handler: Handler<SQSEvent, void> = async (event, context) => {
  const [sqsRecord] = event.Records
  const handleEvmTransactionEventsService = await initializeEvmTransactionEventsHandlerService()

  await handleEvmTransactionEventsService.handleEvmTransactionEvent(JSON.parse(sqsRecord.body))
}
