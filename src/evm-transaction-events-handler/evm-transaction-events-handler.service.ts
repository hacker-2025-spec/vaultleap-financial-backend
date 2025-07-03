import { ConfigService } from '@nestjs/config'
import { Inject, Injectable, Logger } from '@nestjs/common'
import type { PutEventsCommandInput } from '@aws-sdk/client-eventbridge'
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge'
import { SendTaskFailureCommand, SendTaskSuccessCommand, SFNClient } from '@aws-sdk/client-sfn'

import { ConfigKeys } from '../config/config.interface'
import { CreatorHandlerService } from '../creator-handler/creator-handler.service'
import { TRANSACTION_STATUS, TRANSACTION_TYPE_CREATOR } from '../evm-transaction-sender/evm-transaction-sender.types'

import type { EvmTransactionEvent } from './evm-transaction-events-handler.types'

@Injectable()
export class EvmTransactionEventsHandlerService {
  private readonly EVENT_BUS_NAME: string
  private static readonly logger = new Logger(EvmTransactionEventsHandlerService.name)

  constructor(
    private readonly creatorHandlerService: CreatorHandlerService,
    @Inject(EventBridgeClient) private eventBridge: EventBridgeClient,
    @Inject(SFNClient) private sfnClient: SFNClient,
    private configService: ConfigService
  ) {
    this.EVENT_BUS_NAME = this.configService.get(`${ConfigKeys.EVM_EVENT_BUS_NAME}`) || ''
  }

  async handleEvmTransactionEvent(event: EvmTransactionEvent) {
    EvmTransactionEventsHandlerService.logger.log(
      'EvmTransactionEventsHandlerService => handleEvmTransactionEvent => event',
      JSON.stringify(event)
    )
    if (event.detail.transactionType === TRANSACTION_TYPE_CREATOR.VAULT_CREATION) {
      const vaultId = event.detail.originOperationId
      await this.creatorHandlerService.updateVaultTransactionDetails(vaultId, event.detail.transactionHash, event.detail.transactionStatus)
      if (event.detail.transactionStatus === TRANSACTION_STATUS.SUCCESSFUL) {
        await this.startMonitoringVaultClaim(vaultId)
        if (event.detail.taskToken) {
          EvmTransactionEventsHandlerService.logger.log('EvmTransactionEventsHandlerService => handleEvmTransactionEvent => successCommand')
          const successCommand = new SendTaskSuccessCommand({
            taskToken: event.detail.taskToken,
            output: JSON.stringify({ message: 'Task completed successfully!' }),
          })
          await this.sfnClient.send(successCommand)
        }
      } else if (event.detail.transactionStatus === TRANSACTION_STATUS.REJECTED) {
        await this.creatorHandlerService.removePrivateKeyWhenCreationFailed(vaultId)
        if (event.detail.taskToken) {
          EvmTransactionEventsHandlerService.logger.log('EvmTransactionEventsHandlerService => handleEvmTransactionEvent => failureCommand')
          const failureCommand = new SendTaskFailureCommand({
            taskToken: event.detail.taskToken,
            error: 'ProcessingFailed',
          })
          await this.sfnClient.send(failureCommand)
        }
      }
    }
  }

  async startMonitoringVaultClaim(vaultId: string) {
    const input: PutEventsCommandInput = {
      Entries: [
        {
          Time: new Date(),
          Source: 'getrewards.api',
          EventBusName: this.EVENT_BUS_NAME,
          DetailType: 'start-monitoring-vault-event',
          Detail: JSON.stringify({ vaultId }),
        },
      ],
    }
    EvmTransactionEventsHandlerService.logger.log(`Putting event: ${JSON.stringify(input, null, 2)}`)

    const putEventsCommand = new PutEventsCommand(input)
    const event = await this.eventBridge.send(putEventsCommand)

    if (event?.FailedEntryCount && event?.FailedEntryCount !== 0) {
      EvmTransactionEventsHandlerService.logger.error('Failed to send event', JSON.stringify(event.Entries))
    }
  }
}
