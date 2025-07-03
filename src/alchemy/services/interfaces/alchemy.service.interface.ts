import type { AssetTransfersWithMetadataResult } from 'alchemy-sdk'

/**
 * Interface for interacting with the Alchemy SDK to retrieve blockchain data
 * and manage webhooks for address activity.
 */
export interface IAlchemyService {
  /**
   * Fetch historical asset transfers for a list of addresses.
   * @param addresses - List of blockchain wallet addresses.
   * @returns A promise that resolves with an array of asset transfer records.
   */
  getHistoricalData: (addresses: string[]) => Promise<AssetTransfersWithMetadataResult[]>

  /**
   * Create a new webhook for monitoring address activity.
   * Removes any existing webhooks for the same network to ensure only one exists.
   * @param addresses - List of wallet addresses to monitor.
   */
  createWebhook: (addresses: string[]) => Promise<void>

  /**
   * Update the existing webhook with a new list of addresses.
   * If no existing webhook is found, a new one is created.
   * @param newAddresses - List of new wallet addresses to track.
   */
  updateWebhook: (newAddresses: string[]) => Promise<void>
}
