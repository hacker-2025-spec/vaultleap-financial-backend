import { table, hashKey, attribute } from '@nova-odm/annotations'
import { ApiProperty } from '@nestjs/swagger'

import { TablesNames } from '../utils/tablesNames'

@table(TablesNames.BRIDGE_KYC)
export class BridgeKYCEntity {
  @ApiProperty({
    description: 'The Auth0 ID associated with the user',
    type: String,
  })
  @hashKey({ type: 'String', keyType: 'HASH', attributeName: 'auth0Id' })
  auth0Id: string

  @ApiProperty({
    description: 'Unique identifier for the KYC record',
    type: String,
  })
  @attribute()
  id: string

  @ApiProperty({
    description: 'Unique identifier from Bridge for the KYC process',
    type: String,
  })
  @attribute()
  bridgeKycId: string

  @ApiProperty({
    description: 'Full name of the user undergoing KYC',
    type: String,
  })
  @attribute()
  full_name: string

  @ApiProperty({
    description: 'Email address of the user',
    type: String,
  })
  @attribute()
  email: string

  @ApiProperty({
    description: 'Type of KYC process (e.g., individual, business)',
    type: String,
  })
  @attribute()
  type: string

  @ApiProperty({
    description: 'Link to the KYC document or verification page',
    type: String,
  })
  @attribute()
  kyc_link: string

  @ApiProperty({
    description: 'Link to the Terms of Service document',
    type: String,
  })
  @attribute()
  tos_link: string

  @ApiProperty({
    description: 'Status of the KYC process (e.g., pending, approved)',
    type: String,
  })
  @attribute()
  kyc_status: string

  @ApiProperty({
    description: 'Status of the Terms of Service agreement (e.g., accepted, not accepted)',
    type: String,
  })
  @attribute()
  tos_status: string

  @ApiProperty({
    description: 'Timestamp when the KYC record was created',
    type: String,
  })
  @attribute()
  created_at: string

  @ApiProperty({
    description: 'Customer ID linked to the user in your system',
    type: String,
  })
  @attribute()
  customer_id: string

  @ApiProperty({
    description: 'Type of Persona inquiry used (e.g., identity, verification)',
    type: String,
  })
  @attribute()
  persona_inquiry_type: string
}
