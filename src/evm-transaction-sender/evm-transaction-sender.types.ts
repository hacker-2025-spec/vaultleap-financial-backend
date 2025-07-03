// eslint-disable-next-line @typescript-eslint/naming-convention
export enum TRANSACTION_STATUS {
  CREATED = 'created',
  SUBMITTED = 'submitted',
  SUCCESSFUL = 'successful',
  REJECTED = 'rejected',
}
// eslint-disable-next-line @typescript-eslint/naming-convention
export enum TRANSACTION_TYPE_CREATOR {
  VAULT_CREATION = 'vault_creation',
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export enum TRANSACTION_TYPE_RECIPIENT {
  CLAIM_VAULT_KEYS = 'claim_vault_keys',
  SEND_NFT = 'send_nfts',
  SEND_USDC = 'send_usdc',
  CLAIM_USDC = 'claim_usdc',
  RECLAIM_VAULT_KEYS = 'reclaim_vault_keys',
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export type TRANSACTION_TYPE = TRANSACTION_TYPE_CREATOR | TRANSACTION_TYPE_RECIPIENT

export type BaseTransactionRequestDetail = {
  transactionType: TRANSACTION_TYPE
  to: string
  data: string
  value: string
  origin: string
  auth0Id: string
}

export type TransactionRequestDetailVaultCreation = BaseTransactionRequestDetail & {
  transactionType: TRANSACTION_TYPE_CREATOR.VAULT_CREATION
  originOperationId: string
  taskToken?: string
}

export type TransactionRequestDetailWithUser = BaseTransactionRequestDetail & {
  transactionType: TRANSACTION_TYPE_RECIPIENT
}

export type TransactionRequestDetail = TransactionRequestDetailVaultCreation | TransactionRequestDetailWithUser

export interface TransactionRequestData {
  detail: TransactionRequestDetail
}
