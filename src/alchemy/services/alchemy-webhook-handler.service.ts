import { createHmac, timingSafeEqual } from 'node:crypto'

import { HttpStatus, Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { DataMapper } from '@nova-odm/mapper'

import { mapAlchemyWebhookEventToTransactionItems } from '../../transaction-items/mappers/alchemy.mapper'
import { TransactionItemService } from '../../transaction-items/services/transaction-item.service'
import type { AlchemyWebhookDto } from '../dtos/request/alchemy-webhook.dto'
import { AlchemyTransactionService } from './alchemy-transaction.service'
import type { IAlchemyWebhookHandlerService } from './interfaces/alchemy-webhook-handler.service.interface'
import { AlchemyClientService } from './alchemy-client.service'
import type { TransactionItemEntity } from '../../transaction-items/transaction-item.entity'

@Injectable()
export class AlchemyWebhookHandlerService implements IAlchemyWebhookHandlerService {
  private readonly logger = new Logger(AlchemyWebhookHandlerService.name)
  constructor(
    @Inject(DataMapper) protected dataMapper: DataMapper,
    private readonly alchemyTransactionService: AlchemyTransactionService,
    private readonly alchemyClient: AlchemyClientService,
    private readonly transactionItemService: TransactionItemService
  ) {}

  async processWebhook(rawBody: string, signature: string): Promise<void> {
    const webhookDto = JSON.parse(rawBody) as AlchemyWebhookDto
    const { webhookId } = webhookDto
    const alchemyWebhook = await this.alchemyClient.getWebhookById(webhookId)
    if (!alchemyWebhook) {
      this.logger.warn(`Webhook with ID: ${webhookId} not found`)
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Webhook not found',
      })
    }

    const { signingKey, network } = alchemyWebhook

    if (!this.isValidAlchemySignature(rawBody, signature, signingKey)) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Invalid Alchemy signature',
      })
    }

    const transactionItems = mapAlchemyWebhookEventToTransactionItems(webhookDto, network)
    const validTxs = transactionItems.filter(this.isValidTx)

    if (transactionItems.length > 0) {
      await this.alchemyTransactionService.addUserAuthIdsToTransactions(validTxs)
      await this.transactionItemService.batchUpsert(validTxs)
    }
  }

  private isValidTx(item: TransactionItemEntity): boolean {
    const validAddresses = this.alchemyClient.getContractAddresses()
    return validAddresses.includes(item.rawContract?.address || '')
  }
  /**
   *
   * @param rawBody stringified JSON body of the webhook request
   * @param signature  HMAC SHA256 signature from the request headers
   * @param signingKey  The secret key used to sign the webhook request
   * @returns boolean indicating whether the signature is valid
   */
  private isValidAlchemySignature(rawBody: string, signature: string, signingKey: string): boolean {
    const hmac = createHmac('sha256', signingKey)
    hmac.update(rawBody, 'utf8')
    const digest = hmac.digest('hex')

    const digestBuffer = Buffer.from(digest, 'utf8')
    const signatureBuffer = Buffer.from(signature, 'utf8')

    return digestBuffer.length === signatureBuffer.length && timingSafeEqual(digestBuffer, signatureBuffer)
  }
}
