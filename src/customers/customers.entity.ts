import { v4 as uuid } from 'uuid'

import { table, hashKey, attribute } from '@nova-odm/annotations'
import { ApiProperty } from '@nestjs/swagger'

import { TablesNames } from '../utils/tablesNames'

@table(TablesNames.CUSTOMERS)
export class CustomerEntity {
  @ApiProperty({
    description: 'The Auth0 ID associated with the user',
    type: String,
  })
  @hashKey({ type: 'String', keyType: 'HASH', attributeName: 'auth0Id' })
  auth0Id: string

  @ApiProperty({
    description: 'Unique identifier for the customer record',
    type: String,
  })
  @attribute({ defaultProvider: () => uuid() })
  id: string

  @ApiProperty({
    description: 'The Bridge customer ID for the user',
    type: String,
  })
  @attribute()
  bridgeCustomerId: string

  @ApiProperty({
    description: 'First name of the customer',
    type: String,
  })
  @attribute()
  first_name: string

  @ApiProperty({
    description: 'Last name of the customer',
    type: String,
  })
  @attribute()
  last_name: string

  @ApiProperty({
    description: 'Email address of the customer',
    type: String,
  })
  @attribute()
  email: string

  @ApiProperty({
    description: 'The current status of the customer (e.g., active, suspended)',
    type: String,
  })
  @attribute()
  status: string

  @ApiProperty({
    description: 'Type of customer, either individual or business',
    type: String,
    enum: ['individual', 'business'],
  })
  @attribute()
  type: 'individual' | 'business'

  @ApiProperty({
    description: 'List of future requirements that are due for the customer',
    type: [String],
  })
  @attribute()
  future_requirements_due: string[]

  @ApiProperty({
    description: 'List of current requirements that are due for the customer',
    type: [String],
  })
  @attribute()
  requirements_due: string[]

  @ApiProperty({
    description: 'Capabilities of the customer, represented as key-value pairs',
    type: 'object',
    additionalProperties: { type: 'string' },
  })
  @attribute()
  capabilities: Record<string, string>

  @ApiProperty({
    description: 'Type of Persona inquiry performed for the customer (e.g., identity verification)',
    type: String,
  })
  @attribute()
  persona_inquiry_type: string

  @ApiProperty({
    description: 'Timestamp when the customer record was created',
    type: String,
  })
  @attribute()
  created_at: string

  @ApiProperty({
    description: 'Timestamp when the customer record was last updated',
    type: String,
  })
  @attribute()
  updated_at: string

  @ApiProperty({
    description: 'Reasons for rejection, if applicable',
    type: [String],
  })
  @attribute()
  rejection_reasons: any[]

  @ApiProperty({
    description: 'Whether the customer has accepted the terms of service',
    type: Boolean,
  })
  @attribute()
  has_accepted_terms_of_service: boolean

  @ApiProperty({
    description: 'Internal identifier for the signed TOS agreement that can be used for attestation',
    type: String,
    required: false,
  })
  @attribute()
  signed_agreement_id?: string

  @ApiProperty({
    description: 'List of endorsements with the name and status of each endorsement',
    type: [Object],
    items: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        status: { type: 'string' },
      },
    },
  })
  @attribute()
  endorsements: { name: string; status: string }[]
}
