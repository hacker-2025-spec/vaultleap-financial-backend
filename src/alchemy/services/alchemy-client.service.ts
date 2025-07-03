import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Webhook, AssetTransfersWithMetadataResult } from 'alchemy-sdk'
import { Alchemy, AssetTransfersCategory, Network, SortingOrder, WebhookType } from 'alchemy-sdk'

import { CONTRACT_ADDRESSES } from '../../common/constants'
import { ConfigKeys, Environment } from '../../config/config.interface'
import { SecretsManagerService } from '../../secrets-manager/secrets-manager.service'
import type { IAlchemyClientService } from './interfaces/alchemy-client.service.interface'

@Injectable()
export class AlchemyClientService implements IAlchemyClientService {
  private readonly logger = new Logger(AlchemyClientService.name)
  private readonly alchemy: Alchemy
  private readonly contractAddresses: string[]
  private readonly webhookUrl: string
  private readonly network: Network

  constructor(
    private readonly configService: ConfigService,
    private readonly secretsManagerService: SecretsManagerService
  ) {
    this.network = Network.BASE_MAINNET
    this.webhookUrl = this.buildWebhookUrl()
    this.contractAddresses = this.getContractAddresses()
    this.alchemy = this.initializeAlchemy()
  }

  private buildWebhookUrl(): string {
    const env = this.configService.get<Environment>(ConfigKeys.ENVIRONMENT) as Environment

    const domain = env === Environment.PRODUCTION ? 'api.vaultleap.com' : 'stage-api.vaultleap.com'

    return `https://${domain}/webhook/alchemy`
  }

  getContractAddresses(): string[] {
    return [
      CONTRACT_ADDRESSES.BASE_SEPOLIA.EURC,
      CONTRACT_ADDRESSES.BASE_SEPOLIA.USDC,
      CONTRACT_ADDRESSES.BASE_MAINNET.EURC,
      CONTRACT_ADDRESSES.BASE_MAINNET.USDC,
    ]
  }

  private initializeAlchemy(): Alchemy {
    return new Alchemy({
      apiKey: this.secretsManagerService.getAlchemyApiKey(),
      authToken: this.secretsManagerService.getAlchemyAuthToken(),
      network: this.network,
    })
  }

  getNetwork(): Network {
    return this.network
  }

  async getAssetTransfersForAddress(address: string): Promise<AssetTransfersWithMetadataResult[]> {
    const transferCategories = [
      AssetTransfersCategory.EXTERNAL,
      AssetTransfersCategory.ERC20,
      AssetTransfersCategory.ERC721,
      AssetTransfersCategory.ERC1155,
    ]
    const [toTransfers, fromTransfers] = await Promise.all([
      this.alchemy.core.getAssetTransfers({
        contractAddresses: this.contractAddresses,
        toAddress: address,
        category: transferCategories,
        order: SortingOrder.ASCENDING,
        withMetadata: true,
      }),
      this.alchemy.core.getAssetTransfers({
        contractAddresses: this.contractAddresses,
        fromAddress: address,
        category: transferCategories,
        order: SortingOrder.ASCENDING,
        withMetadata: true,
      }),
    ])

    return [...toTransfers.transfers, ...fromTransfers.transfers].map((t) => ({
      ...t,
      from: t.from.toLowerCase(),
      to: t.to?.toLowerCase() || null,
    }))
  }

  async createWebhook(addresses: string[]): Promise<void> {
    try {
      const webhook = await this.alchemy.notify.createWebhook(this.webhookUrl, WebhookType.ADDRESS_ACTIVITY, {
        addresses,
        network: this.network,
      })
      this.logger.log(`Created webhook ${webhook.id} with URL: ${this.webhookUrl}`)
    } catch (error) {
      this.handleAlchemyError('createWebhook', error)
    }
  }

  async updateWebhook(addresses: string[]): Promise<void> {
    try {
      const { webhooks } = await this.alchemy.notify.getAllWebhooks()
      const existing = webhooks.find((w) => w.url === this.webhookUrl && w.network === this.network)
      if (existing) {
        await this.alchemy.notify.updateWebhook(existing.id, { newAddresses: addresses })
        this.logger.log(`Updated webhook ${existing.id} with ${addresses.length} address(es)`)
      } else {
        const webhook = await this.alchemy.notify.createWebhook(this.webhookUrl, WebhookType.ADDRESS_ACTIVITY, {
          addresses,
          network: this.network,
        })
        this.logger.log(`Created new webhook ${webhook.id} with ${addresses.length} address(es)`)
      }
    } catch (error) {
      this.handleAlchemyError('updateWebhook', error)
    }
  }

  async getWebhookById(webhookId: string): Promise<Webhook | null> {
    try {
      const { webhooks } = await this.alchemy.notify.getAllWebhooks()
      return webhooks.find((w) => w.id === webhookId) || null
    } catch (error) {
      this.handleAlchemyError('getWebhookById', error)
      return null
    }
  }

  async deleteWebhookById(webhookId: string): Promise<void> {
    const webhook = await this.getWebhookById(webhookId)
    if (webhook) {
      await this.alchemy.notify.deleteWebhook(webhook)
    }
  }

  private handleAlchemyError(context: string, error: any): void {
    this.logger.error(`Failed to ${context}: ${error?.message}`, error?.stack)
    throw new Error(`Alchemy ${context} failed`)
  }
}
