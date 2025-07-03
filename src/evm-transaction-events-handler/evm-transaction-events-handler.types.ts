import type { TRANSACTION_STATUS, TRANSACTION_TYPE } from '../evm-transaction-sender/evm-transaction-sender.types'

export interface EvmTransactionEvent {
  'detail-type': string
  source: string
  detail: {
    originOperationId: string
    origin: string
    transactionStatus: TRANSACTION_STATUS
    transactionHash: string
    transactionType: TRANSACTION_TYPE
    taskToken?: string
  }
}
