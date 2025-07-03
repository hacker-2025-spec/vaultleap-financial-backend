import { ConfigService } from '@nestjs/config'
import { Inject, Injectable, Logger } from '@nestjs/common'
import type { PutEventsCommandInput } from '@aws-sdk/client-eventbridge'
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge'

import { ConfigKeys } from '../config/config.interface'

import { EventBridgeResponseError } from './evm-transaction-sender.errors'
import type { TransactionRequestData } from './evm-transaction-sender.types'

@Injectable()
export class EvmTransactionSenderService {
  private static readonly logger = new Logger(EvmTransactionSenderService.name)
  private readonly EVENT_BUS_NAME: string
  private readonly EVENT_SOURCE: string
  private readonly EVENT_DETAIL_TYPE: string

  constructor(
    @Inject(EventBridgeClient) private eventBridge: EventBridgeClient,
    private configService: ConfigService
  ) {
    this.EVENT_BUS_NAME = this.configService.get(`${ConfigKeys.EVM_EVENT_BUS_NAME}`) || ''
    this.EVENT_DETAIL_TYPE = this.configService.get(`${ConfigKeys.EVM_EVENT_DETAIL_TYPE}`) || ''
    this.EVENT_SOURCE = this.configService.get(`${ConfigKeys.EVM_EVENT_SOURCE}`) || ''
  }

  async sendTransactionEvent(transactionRequest: TransactionRequestData['detail']) {
    const input: PutEventsCommandInput = {
      Entries: [
        {
          Time: new Date(),
          Source: this.EVENT_SOURCE,
          EventBusName: this.EVENT_BUS_NAME,
          DetailType: this.EVENT_DETAIL_TYPE,
          Detail: JSON.stringify(transactionRequest),
        },
      ],
    }
    EvmTransactionSenderService.logger.log(`Putting event: ${JSON.stringify(input, null, 2)}`)

    const putEventsCommand = new PutEventsCommand(input)
    const event = await this.eventBridge.send(putEventsCommand)

    if (event?.FailedEntryCount && event?.FailedEntryCount !== 0) {
      EvmTransactionSenderService.logger.error('Failed to send event', JSON.stringify(event.Entries))
      throw new EventBridgeResponseError(JSON.stringify(event.Entries))
    }
  }
}
