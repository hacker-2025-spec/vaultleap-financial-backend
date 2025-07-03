import type { ERC1155Metadata } from 'alchemy-sdk'

import { table, hashKey, attribute } from '@nova-odm/annotations'
import { ApiProperty } from '@nestjs/swagger'

import { TablesNames } from '../utils/tablesNames'

export enum TransactionSource {
  ALCHEMY = 'alchemy',
  BRIDGE = 'bridge',
  MANUAL = 'manual',
}

export class RawContract {
  @ApiProperty()
  value: string | null

  @ApiProperty()
  address: string | null

  @ApiProperty()
  decimal: number | null
}

@table(TablesNames.TRANSACTION_ITEMS)
export class TransactionItemEntity {
  @ApiProperty({ description: 'Globally unique ID for the transaction item' })
  @hashKey({ attributeName: 'id', type: 'String' })
  id: string

  @ApiProperty({
    description: 'The Auth0 ID associated with the user',
    type: String,
  })
  @attribute({
    indexKeyConfigurations: {
      auth0IdIndex: 'HASH',
    },
  })
  auth0Id: string

  @ApiProperty({ enum: TransactionSource })
  @attribute()
  source: TransactionSource

  @attribute()
  rawData: Record<string, unknown>

  @attribute()
  customerId: string

  @attribute()
  virtualAccountId?: string

  @attribute()
  sourceEventId?: string

  @attribute()
  type: string

  @attribute()
  amount?: number

  @attribute()
  currency?: string

  @attribute()
  developerFeeAmount?: number

  @attribute()
  exchangeFeeAmount?: number

  @attribute({
    indexKeyConfigurations: {
      depositIdIndex: 'HASH',
    },
  })
  depositId?: string

  @attribute()
  description?: string

  @attribute()
  senderName?: string

  @attribute({
    indexKeyConfigurations: {
      traceNumberIndex: 'HASH',
    },
  })
  traceNumber?: string

  // 🆕 Blockchain-specific fields

  @attribute()
  hash?: string

  @attribute()
  fromAddress?: string

  @attribute()
  toAddress?: string

  @attribute()
  erc721TokenId?: string | null

  @attribute()
  erc1155Metadata?: ERC1155Metadata[] | null

  @attribute()
  tokenId?: string | null

  @attribute()
  category?: string

  @attribute()
  rawContract?: RawContract

  @attribute()
  metadata?: Record<string, any>

  @attribute({
    indexKeyConfigurations: {
      senderAuth0IdIndex: 'HASH',
    },
  })
  senderAuth0Id?: string

  @attribute({
    indexKeyConfigurations: {
      receiverAuth0IdIndex: 'HASH',
    },
  })
  receiverAuth0Id?: string

  @attribute()
  blockNum?: string

  @attribute()
  uniqueId?: string

  @attribute()
  network?: string

  @attribute()
  occurredAt: number

  @attribute({ defaultProvider: () => new Date() })
  createdAt?: Date

  @attribute({ defaultProvider: () => new Date() })
  updatedAt?: Date
}
