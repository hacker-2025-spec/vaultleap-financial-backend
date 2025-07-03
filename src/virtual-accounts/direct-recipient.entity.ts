import { attribute, hashKey, rangeKey, table } from '@nova-odm/annotations'
import { ApiProperty } from '@nestjs/swagger'

import { TablesNames } from '../utils/tablesNames'

@table(TablesNames.DIRECT_RECIPIENTS)
export class DirectRecipientEntity {
  @ApiProperty({
    description: 'User Auth0 ID',
    type: String,
  })
  @hashKey({ type: 'String', keyType: 'HASH', attributeName: 'auth0Id' })
  auth0Id: string

  @ApiProperty({
    description: 'Unique recipient ID',
    type: String,
  })
  @rangeKey({ type: 'String', keyType: 'RANGE', attributeName: 'id' })
  @attribute()
  id: string

  @ApiProperty({
    description: 'Vault name',
    type: String,
  })
  @attribute()
  vaultName: string

  @ApiProperty({
    description: 'Destination Ethereum address',
    type: String,
  })
  @attribute({
    indexKeyConfigurations: {
      destinationAddressIndex: 'HASH',
    },
  })
  destinationAddress: string

  @ApiProperty({
    description: 'Blockchain chain (always base for now)',
    type: String,
  })
  @attribute()
  chain: string

  @ApiProperty({
    description: 'Currency (always usdc for now)',
    type: String,
  })
  @attribute()
  currency: string

  @ApiProperty({
    description: 'Developer fee percentage',
    type: String,
    required: false,
  })
  @attribute()
  feePercentage?: string

  @ApiProperty({
    description: 'Creation timestamp',
    type: Date,
  })
  @attribute()
  createdAt: Date

  @ApiProperty({
    description: 'Last update timestamp',
    type: Date,
  })
  @attribute()
  updatedAt: Date
}
