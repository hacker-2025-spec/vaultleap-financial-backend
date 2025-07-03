import { table, hashKey, attribute, rangeKey } from '@nova-odm/annotations'
import { ApiProperty } from '@nestjs/swagger'

import { TablesNames } from '../utils/tablesNames'

@table(TablesNames.BANKING_INFO)
export class BankingInfoEntity {
  @ApiProperty({
    description: 'The Auth0 ID associated with the user',
    type: String,
  })
  @hashKey({ type: 'String', keyType: 'HASH', attributeName: 'auth0Id' })
  auth0Id: string

  @ApiProperty({
    description: 'Unique identifier for the banking information record',
    type: String,
  })
  @rangeKey({ type: 'String', keyType: 'RANGE', attributeName: 'id' })
  id: string

  @ApiProperty({
    description: 'Type of bank account (e.g., checking, savings)',
    type: String,
  })
  @attribute()
  account_type: string

  @ApiProperty({
    description: 'Currency associated with the account (e.g., USD, EUR)',
    type: String,
  })
  @attribute()
  currency: string

  @ApiProperty({
    description: 'Customer ID linked to the user in your system',
    type: String,
  })
  @attribute()
  customer_id: string

  @ApiProperty({
    description: 'Full name of the account owner',
    type: String,
  })
  @attribute()
  account_owner_name: string

  @ApiProperty({
    description: 'Individual or Bussiness',
    type: String,
  })
  @attribute()
  account_owner_type?: string

  @ApiProperty({
    description: 'First anme',
    type: String,
  })
  @attribute()
  first_name?: string

  @ApiProperty({
    description: 'Last name',
    type: String,
  })
  @attribute()
  last_name?: string

  @ApiProperty({
    description: 'business name',
    type: String,
  })
  @attribute()
  business_name?: string

  @ApiProperty({
    description: 'Name of the bank where the account is held',
    type: String,
  })
  @attribute()
  bank_name: string

  @ApiProperty({
    description: 'Last 4 digits of the account number',
    type: String,
  })
  @attribute()
  last_4: string

  @ApiProperty({
    description: 'Whether the account is active or not',
    type: Boolean,
  })
  @attribute()
  active: boolean

  @ApiProperty({
    description: 'Indicates whether the beneficiary address is valid',
    type: Boolean,
  })
  @attribute()
  beneficiary_address_valid: boolean

  @ApiProperty({
    description: 'Account details including last 4 digits, routing number, and account type',
    type: Object,
    properties: {
      last_4: { type: 'string' },
      routing_number: { type: 'string' },
      checking_or_savings: { type: 'string' },
    },
  })
  @attribute()
  account?: {
    last_4: string
    routing_number: string
    checking_or_savings: string
  }

  @ApiProperty({
    description: 'Iban account details including last 4 digits',
    type: Object,
    properties: {
      last_4: { type: 'string' },
      bic: { type: 'string' },
      country: { type: 'string' },
    },
  })
  @attribute()
  iban?: {
    last_4: string
    bic: string
    country: string
  }

  @ApiProperty({
    description: 'Timestamp when the banking information was created',
    type: String,
  })
  @attribute()
  created_at: string

  @ApiProperty({
    description: 'Timestamp when the banking information was last updated',
    type: String,
  })
  @attribute()
  updated_at: string
}
