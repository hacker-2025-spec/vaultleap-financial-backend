import { table, hashKey, attribute, rangeKey } from '@nova-odm/annotations'
import { ApiProperty } from '@nestjs/swagger'

import { TablesNames } from '../utils/tablesNames'

@table(TablesNames.LIQUIDATION_ADDRESSES)
export class LiquidationAddressEntity {
  @ApiProperty({
    description: 'The Auth0 ID associated with the user',
    type: String,
  })
  @hashKey({ type: 'String', keyType: 'HASH', attributeName: 'auth0Id' })
  auth0Id: string

  @ApiProperty({
    description: 'Unique identifier for the liquidation address record',
    type: String,
  })
  @rangeKey({ type: 'String', keyType: 'RANGE', attributeName: 'id' })
  @attribute()
  id: string

  @ApiProperty({
    description: 'The Bridge liquidation address ID associated with the user',
    type: String,
  })
  @attribute()
  bridgeLiquidationAddressId: string

  @ApiProperty({
    description: 'The blockchain chain associated with the liquidation address (e.g., Ethereum, Bitcoin)',
    type: String,
  })
  @attribute()
  chain: string

  @ApiProperty({
    description: 'The state or status of the liquidation address',
    type: String,
  })
  @attribute()
  state: string

  @ApiProperty({
    description: 'The address associated with the liquidation',
    type: String,
  })
  @attribute({
    indexKeyConfigurations: {
      addressIndex: 'HASH',
    },
  })
  address: string

  @ApiProperty({
    description: 'The currency used for the liquidation (e.g., USD, EUR, BTC)',
    type: String,
  })
  @attribute()
  currency: string

  @ApiProperty({
    description: 'Timestamp when the liquidation address record was created',
    type: String,
  })
  @attribute()
  created_at: string

  @ApiProperty({
    description: 'Timestamp when the liquidation address record was last updated',
    type: String,
  })
  @attribute()
  updated_at: string

  @ApiProperty({
    description: 'Developer fee details associated with the liquidation address',
    type: Object,
    properties: {
      percent: { type: 'string' },
    },
  })
  @attribute()
  developer_fee: {
    percent: string
  }

  @ApiProperty({
    description: 'External account ID related to the liquidation address',
    type: String,
  })
  @attribute()
  external_account_id: string

  @ApiProperty({
    description: 'Currency to be received at the destination address',
    type: String,
  })
  @attribute()
  destination_currency: string

  @ApiProperty({
    description: 'Payment rail used for the destination transaction (e.g., SWIFT, PayPal)',
    type: String,
  })
  @attribute()
  destination_payment_rail: string

  @ApiProperty({
    description: 'Custom developer fee percentage for the liquidation process',
    type: String,
  })
  @attribute()
  custom_developer_fee_percent: string

  @ApiProperty({
    description: 'Vault name',
    type: String,
  })
  @attribute()
  vault_name: string
}
