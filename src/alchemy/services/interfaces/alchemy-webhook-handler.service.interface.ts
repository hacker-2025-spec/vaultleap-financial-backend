/**
 * Interface for the Alchemy Webhook Handler Service, which handles
 * validation and processing of incoming webhook events from Alchemy.
 */
export interface IAlchemyWebhookHandlerService {
  /**
   * Processes a raw Alchemy webhook request.
   *
   * - Validates the HMAC signature.
   * - Maps the webhook payload into transaction items.
   * - Enriches them with customer/account metadata.
   * - Persists them to the transaction store.
   *
   * @param rawBody - The stringified JSON body of the webhook request.
   * @param signature - The HMAC SHA256 signature provided in the request headers.
   * @returns A Promise that resolves when processing is complete.
   * @throws UnauthorizedException if the webhook ID is invalid or the signature is not valid.
   */
  processWebhook: (rawBody: string, signature: string) => Promise<void>
}
