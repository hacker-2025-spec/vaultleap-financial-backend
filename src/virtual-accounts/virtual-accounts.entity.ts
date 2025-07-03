import { table, hashKey, attribute, rangeKey } from '@nova-odm/annotations'
import { ApiProperty } from '@nestjs/swagger'

import { TablesNames } from '../utils/tablesNames'
import {
  type SourceDepositInstructionsIbanDto,
  type SourceDepositInstructionsUsDto,
  VirtualAccountDestinationDto,
} from '../bridge-xyz/bridge-xyz.dto'

@table(TablesNames.VIRTUAL_ACCOUNTS)
export class VirtualAccountEntity {
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
    description: 'Status of the virtual account.',
    example: 'active',
  })
  @attribute()
  status: string

  @ApiProperty({
    description: 'Customer identifier.',
    example: 'cust_abc123',
  })
  @attribute()
  customer_id: string

  @ApiProperty({
    oneOf: [
      { $ref: '#/components/schemas/SourceDepositInstructionsUsDto' },
      { $ref: '#/components/schemas/SourceDepositInstructionsIbanDto' },
    ],
    description: 'Banking information',
  })
  @attribute()
  source_deposit_instructions: SourceDepositInstructionsIbanDto | SourceDepositInstructionsUsDto

  @ApiProperty({
    description: 'Destination details for the transaction.',
    example: {
      payment_rail: 'base',
      currency: 'usdc',
      address: '0x1234567890abcdef1234567890abcdef12345678',
    },
    type: () => VirtualAccountDestinationDto,
  })
  @attribute()
  destination: VirtualAccountDestinationDto

  @attribute({
    indexKeyConfigurations: {
      destinationAddressIndex: 'HASH',
    },
  })
  destination_address: string

  @ApiProperty({
    description: 'Developer fee percentage.',
    example: '1.0',
  })
  @attribute()
  developer_fee_percent: string

  @ApiProperty({
    description: 'Custom name of the virtual account. (vault)',
    example: 'My virtual account',
  })
  @attribute()
  vault_name: string
}
