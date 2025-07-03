export class EventBridgeResponseError extends Error {
  constructor(msg?: string) {
    super(`[AWS EventBridge] Response Error ${msg}`)
  }
}
