import type { Webhook, AssetTransfersWithMetadataResult, Network } from 'alchemy-sdk'

/**
 * Describes Alchemy client operations like reading transfers and managing webhooks.
 */
export interface IAlchemyClientService {
  /**
   * Get all token transfers related to the given address.
   * @param address - Wallet address to fetch transfers for.
   */
  getAssetTransfersForAddress: (address: string) => Promise<AssetTransfersWithMetadataResult[]>

  /**
   * Create a new webhook for a set of wallet addresses.
   * @param addresses - Addresses to be monitored.
   */
  createWebhook: (addresses: string[]) => Promise<void>

  /**
   * Create or update a webhook for the given addresses.
   * @param addresses - Addresses to be monitored.
   */
  updateWebhook: (addresses: string[]) => Promise<void>

  /**
   * Retrieve a webhook by its Alchemy-assigned ID.
   * @param webhookId - ID of the webhook.
   */
  getWebhookById: (webhookId: string) => Promise<Webhook | null>
}
