export type AlchemyWebhookType = 'ADDRESS_ACTIVITY'

export interface AlchemyWebhookEventActivity {
  category: string
  blockNum: string
  fromAddress: string
  toAddress: string
  value: number
  asset: string
  hash: string
  erc721TokenId: string | null
  erc1155Metadata: any[] | null
  rawContract: {
    rawValue: string
    address: string
    decimals: number
  }
  typeTraceAddress: string | null
  log: {
    address: string
    topics: string[]
    data: string
    blockNumber: string
    transactionHash: string
    transactionIndex: string
    blockHash: string
    logIndex: string
    removed: boolean
  }
}

export interface AlchemyAssetTransfer {
  category: string
  blockNum: string
  from: string
  to: string
  value: number
  asset: string
  hash: string
  rawContract: {
    value: string
    address: string
    decimal: string
  }
  metadata: {
    blockTimestamp: string
  }
}

export interface AlchemyActivityWebhookEvent {
  network: string
  activity: AlchemyWebhookEventActivity[]
  source?: string
}
