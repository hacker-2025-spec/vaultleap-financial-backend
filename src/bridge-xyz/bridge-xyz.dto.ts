import {
  IsString,
  IsObject,
  IsEnum,
  IsEmail,
  ValidateNested,
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsUUID,
  IsDateString,
  IsNotEmpty,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import type { DrainCurrency, DrainState } from './bridge-xyz.types'

export class CreateCustomerFromKycDTO {
  @ApiProperty()
  @IsString()
  full_name: string

  @ApiProperty()
  @IsString()
  email: string

  @ApiProperty()
  @IsEnum(['individual', 'business'])
  type: 'individual' | 'business'
}

export class CreateCustomerFromKycResponseDTO {
  @ApiProperty()
  @IsString()
  id: string

  @ApiProperty()
  @IsString()
  full_name: string

  @ApiProperty()
  @IsEmail()
  email: string

  @ApiProperty()
  @IsEnum(['individual', 'business'])
  type: 'individual' | 'business'

  @ApiProperty()
  @IsString()
  kyc_link: string

  @ApiProperty()
  @IsString()
  tos_link: string

  @ApiProperty()
  @IsString()
  kyc_status: 'not_started' | 'pending' | 'incomplete' | 'awaiting_ubo' | 'manual_review' | 'under_review' | 'approved' | 'rejected'

  @ApiProperty()
  rejection_reasons: { developer_reason?: string; reason?: string; create_at?: string }[]

  @ApiProperty()
  @IsString()
  tos_status: 'pending' | 'approved'

  @ApiProperty()
  @IsString()
  created_at: 'string'

  @ApiProperty()
  @IsString()
  customer_id: string

  @ApiProperty()
  @IsString()
  persona_inquiry_type: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  virtualAccountsCreated?: boolean
}

class Address {
  @ApiProperty({ example: '123 Main St', description: 'Street address line 1' })
  @IsString()
  street_line_1: string

  @ApiProperty({ example: 'Apt 4B', description: 'Street address line 2' })
  @IsString()
  street_line_2: string

  @ApiProperty({ example: 'New York', description: 'City' })
  @IsString()
  city: string

  @ApiProperty({ example: 'NY', description: 'State', required: false })
  @IsString()
  state?: string

  @ApiProperty({ example: '10001', description: 'Postal code' })
  @IsString()
  postal_code: string

  @ApiProperty({ example: 'US', description: 'Country code' })
  @IsString()
  country: string
}

export class BridgeCustomerResponseDto {
  @ApiProperty({ example: '1cae51e5-3d26-4110-8147-e26348555ef7', description: 'Customer ID' })
  @IsUUID()
  id: string

  @ApiProperty({ example: 'John', description: 'First name' })
  @IsString()
  first_name: string

  @ApiProperty({ example: 'Doe', description: 'Last name' })
  @IsString()
  last_name: string

  @ApiProperty({ example: 'john.doe@example.com', description: 'Email address' })
  @IsString()
  email: string

  @ApiProperty({ example: 'active', description: 'Customer status' })
  @IsString()
  status: string

  @ApiProperty({ example: 'individual', description: 'Customer type' })
  @IsString()
  type: string

  @ApiProperty({ example: true, description: 'Has accepted terms of service' })
  @IsBoolean()
  has_accepted_terms_of_service: boolean

  @ApiProperty({ type: () => Address, description: 'Customer address' })
  @ValidateNested()
  @Type(() => Address)
  @IsObject()
  address: Address

  @ApiProperty({ example: ['Invalid ID'], description: 'Rejection reasons', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  rejection_reasons: string[]

  @ApiProperty({ example: ['proof_of_address'], description: 'Current requirements due' })
  @IsArray()
  @IsString({ each: true })
  requirements_due: string[]

  @ApiProperty({ example: ['proof_of_income'], description: 'Future requirements due' })
  @IsArray()
  @IsString({ each: true })
  future_requirements_due: string[]

  @ApiProperty({ example: [{ endorsement: 'verified' }], description: 'Endorsements' })
  @IsArray()
  @IsObject({ each: true })
  endorsements: Record<string, string>[]

  @ApiProperty({ example: '2025-03-04T06:41:47.327Z', description: 'Creation timestamp' })
  @IsString()
  created_at: string

  @ApiProperty({ example: '2025-03-04T06:41:47.357Z', description: 'Last update timestamp' })
  @IsString()
  updated_at: string
}

class UsBankAccount {
  @ApiProperty({ example: '123456789', description: 'Account number' })
  @IsString()
  account_number: string

  @ApiProperty({ example: '021000021', description: 'Routing number' })
  @IsString()
  routing_number: string
}

export class CreateUsExternalAccountDTO {
  @ApiProperty({ type: () => UsBankAccount, description: 'Us bank account details' })
  @ValidateNested()
  @Type(() => UsBankAccount)
  @IsObject()
  account: UsBankAccount

  @ApiProperty({ enum: ['usd'], description: 'Currency', example: 'usd' })
  @IsEnum(['usd'])
  currency: 'usd'

  @ApiProperty({ example: 'John Doe', description: 'Account owner name' })
  @IsString()
  account_owner_name: string

  @ApiProperty({ example: 'Chase Bank', description: 'Bank name' })
  @IsString()
  bank_name: string

  @ApiProperty({ type: () => Address, description: 'Billing address' })
  @ValidateNested()
  @Type(() => Address)
  @IsObject()
  address: Address
}

export class Iban {
  @ApiProperty({
    example: 'AL35202111090000000001234567',
    description: 'The International Bank Account Number (IBAN) that will be used to send the funds',
  })
  @IsString()
  account_number: string

  @ApiProperty({
    example: 'STANALTR',
    description: 'The Bank Identifier Code (BIC) that will be used to send the funds',
  })
  @IsString()
  bic: string

  @ApiProperty({
    example: 'ALB',
    description:
      'Country in which the bank account is located. It`s a three-letter alpha-3 country code as defined in the ISO 3166-1 spec.',
  })
  @IsString()
  country: string
}
export class CreateIbanExternalAccountDTO {
  @ApiProperty({ type: () => Iban, description: 'Us bank account details' })
  @ValidateNested()
  @Type(() => Iban)
  @IsObject()
  iban: Iban

  @ApiProperty({ enum: ['iban'], description: 'Type of the bank accoun', example: 'iban' })
  @IsEnum(['iban'])
  account_type: 'iban'

  @ApiProperty({ enum: ['eur'], description: 'Currency', example: 'eur' })
  @IsEnum(['eur'])
  currency: 'eur'

  @ApiProperty({
    enum: ['individual', 'business'],
    description:
      'The type of the account ownership. Required when the account_type is iban. For individual ownership, first_name and last_name are required. For business ownership, business_name is required.',
    example: 'individual',
  })
  @IsEnum(['individual', 'business'])
  account_owner_type: 'individual' | 'business'

  @ApiProperty({
    example: 'John',
    description: 'First name of the individual account holder. Required when the account_owner_type is individual',
    required: false,
  })
  @IsString()
  @IsOptional()
  first_name?: string

  @ApiProperty({
    example: 'John Doe LLC',
    description: 'Business name of the business account holder. Required when the account_owner_type is business',
    required: false,
  })
  @IsString()
  @IsOptional()
  business_name?: string

  @ApiProperty({
    example: 'Doe',
    description: 'First name of the individual account holder. Required when the account_owner_type is individual',
    required: false,
  })
  @IsString()
  last_name?: string

  @ApiProperty({ example: 'John Doe', description: 'Account owner name' })
  @IsString()
  account_owner_name: string

  @ApiProperty({ example: 'Chase Bank', description: 'Bank name' })
  @IsString()
  @IsOptional()
  bank_name: string

  @ApiProperty({ type: () => Address, description: 'Billing address' })
  @ValidateNested()
  @Type(() => Address)
  @IsObject()
  address: Address
}

class ExternalAccountShortInfo {
  @ApiProperty({ example: '3123', description: 'Last 4 digits of the account number' })
  @IsString()
  last_4: string

  @ApiProperty({ example: '124124122', description: 'Routing number' })
  @IsString()
  routing_number: string

  @ApiProperty({ enum: ['checking', 'savings'], description: 'Account type' })
  @IsEnum(['checking', 'savings'])
  checking_or_savings: 'checking' | 'savings'
}

export class CreateUsExternalAccountResponseDTO {
  @ApiProperty({ example: '1cae51e5-3d26-4110-8147-e26348555ef7', description: 'Unique identifier' })
  @IsUUID()
  id: string

  @ApiProperty({ example: '1810760c-d266-48d9-b58c-3ec406a84df7', description: 'Customer identifier' })
  @IsUUID()
  customer_id: string

  @ApiProperty({ example: '2025-03-04T06:41:47.327Z', description: 'Creation timestamp' })
  @IsString()
  created_at: string

  @ApiProperty({ example: '2025-03-04T06:41:47.357Z', description: 'Last update timestamp' })
  @IsString()
  updated_at: string

  @ApiProperty({ example: 'Chase', description: 'Bank name' })
  @IsString()
  bank_name: string

  @ApiProperty({ example: null, description: 'Account name', required: false })
  @IsOptional()
  @IsString()
  account_name: string | null

  @ApiProperty({ example: 'John Doe', description: 'Account owner name' })
  @IsString()
  account_owner_name: string

  @ApiProperty({ example: true, description: 'Account status' })
  @IsBoolean()
  active: boolean

  @ApiProperty({ enum: ['usd'], description: 'Currency' })
  @IsEnum(['usd'])
  currency: 'usd'

  @ApiProperty({ example: null, description: 'Account owner type', required: false })
  @IsOptional()
  @IsString()
  account_owner_type: string | null

  @ApiProperty({ example: 'us', description: 'Account type' })
  @IsString()
  account_type: string

  @ApiProperty({ example: null, description: 'First name', required: false })
  @IsOptional()
  @IsString()
  first_name: string | null

  @ApiProperty({ example: null, description: 'Last name', required: false })
  @IsOptional()
  @IsString()
  last_name: string | null

  @ApiProperty({ example: null, description: 'Business name', required: false })
  @IsOptional()
  @IsString()
  business_name: string | null

  @ApiProperty({ type: () => ExternalAccountShortInfo, description: 'Bank account details' })
  @ValidateNested()
  @Type(() => ExternalAccountShortInfo)
  @IsObject()
  account: ExternalAccountShortInfo

  @ApiProperty({ example: true, description: 'Beneficiary address validity' })
  @IsBoolean()
  beneficiary_address_valid: boolean

  @ApiProperty({ example: '3123', description: 'Last 4 digits of the account number' })
  @IsString()
  last_4: string
}

class IbanDetails {
  @ApiProperty({ example: '5981', description: 'Last 4 digits of IBAN' })
  @IsString()
  last_4: string

  @ApiProperty({ example: 'BARBGB2LLEI', description: 'BIC code' })
  @IsString()
  bic: string

  @ApiProperty({ example: 'NLD', description: 'Country code' })
  @IsString()
  country: string
}

export class CreateIbanExternalAccountResponseDTO {
  @ApiProperty({ example: 'ea_123', description: 'External account ID' })
  @IsString()
  id: string

  @ApiProperty({ example: 'cust_123', description: 'Customer ID' })
  @IsString()
  customer_id: string

  @ApiProperty({ example: 'iban', description: 'Account type' })
  @IsString()
  account_type: string

  @ApiProperty({ example: 'eur', description: 'Currency' })
  @IsString()
  currency: string

  @ApiProperty({ example: 'John Doe', description: 'Account owner name' })
  @IsString()
  account_owner_name: string

  @ApiProperty({ example: 'AAC CAPITAL PARTNERS LIMITED', description: 'Bank name' })
  @IsString()
  bank_name: string

  @ApiProperty({ example: true, description: 'Account active status' })
  @IsBoolean()
  active: boolean

  @ApiProperty({ description: 'IBAN details' })
  @IsObject()
  iban: IbanDetails

  @ApiProperty({ example: 'individual', description: 'Account owner type' })
  @IsString()
  account_owner_type: string

  @ApiProperty({ example: 'John', description: 'First name' })
  @IsString()
  first_name: string

  @ApiProperty({ example: 'Doe', description: 'Last name' })
  @IsString()
  last_name: string

  @ApiProperty({ example: '2020-01-01T00:00:00.000Z', description: 'Creation date' })
  @IsDateString()
  created_at: string

  @ApiProperty({ example: '2020-01-02T00:00:00.000Z', description: 'Last updated date' })
  @IsDateString()
  updated_at: string
}

export class CreateLiquidationAddressDTO {
  @ApiProperty({
    description: 'Chain type',
    example: 'base',
    enum: ['base'],
  })
  @IsEnum(['base'], {
    message: 'Chain must be "base"',
  })
  chain: 'base'

  @ApiProperty({
    description: 'Currency type',
    example: 'usdc',
    enum: ['usdc'],
  })
  @IsEnum(['usdc'], {
    message: 'Currency must be "usdc"',
  })
  currency: 'usdc'

  @ApiProperty({
    description: 'External account ID',
    example: '1234567890',
  })
  @IsString({
    message: 'External account ID must be a string',
  })
  external_account_id: string

  @ApiProperty({
    description: 'Custom developer fee percent',
    example: '10',
  })
  @IsString({
    message: 'Custom developer fee percent must be a string',
  })
  custom_developer_fee_percent: string

  @ApiProperty({
    description:
      'The payment rail that Bridge will use to send funds to the customer. Will default to ACH if not specified. ach for USD, sepa for EUR',
    example: 'ach',
  })
  @IsString({
    message: 'Custom developer fee percent must be a string',
  })
  destination_payment_rail: 'sepa' | 'ach'

  @ApiProperty({
    description: 'The currency that Bridge will use to send funds to the customer. Will default to USD if not specified',
    example: 'usd',
  })
  @IsString({
    message: 'The currency that Bridge will use to send funds to the customer. Will default to USD if not specified',
  })
  destination_currency: 'eur' | 'usd'
}

export class CreateLiquidationAddressResponseDTO {
  @ApiProperty({
    description: 'ID of the liquidation address',
    example: '123456',
  })
  @IsString()
  id: string

  @ApiProperty({
    description: 'Chain type',
    example: 'base',
  })
  @IsString()
  chain: string

  @ApiProperty({
    description: 'State of the liquidation address',
    example: 'active',
  })
  @IsString()
  state: string

  @ApiProperty({
    description: 'Address for liquidation',
    example: '0xabc123...',
  })
  @IsString()
  address: string

  @ApiProperty({
    description: 'Currency type for the liquidation address',
    example: 'usdc',
  })
  @IsString()
  currency: string

  @ApiProperty({
    description: 'Timestamp when the address was created',
    example: '2025-03-04T12:00:00Z',
  })
  @IsString()
  created_at: string

  @ApiProperty({
    description: 'Timestamp when the address was last updated',
    example: '2025-03-04T12:00:00Z',
  })
  @IsString()
  updated_at: string

  @ApiProperty({
    description: 'Custom developer fee percent ',
    example: { percent: '0.5' },
  })
  @IsObject()
  developer_fee: {
    percent: string
  }

  @ApiProperty({
    description: 'External account ID associated with the liquidation address',
    example: '987654321',
  })
  @IsString()
  external_account_id: string

  @ApiProperty({
    description: 'Destination currency for the transaction',
    example: 'usd',
  })
  @IsString()
  destination_currency: 'eur' | 'usd'

  @ApiProperty({
    description: 'Payment rail for destination',
    example: 'ach',
  })
  @IsString()
  destination_payment_rail: string

  @ApiProperty({
    description: 'Custom developer fee percent ',
    example: '0.5',
  })
  @IsString()
  custom_developer_fee_percent: string
}

export class TxHistoryBridgeItem {
  @ApiProperty()
  @IsString()
  id: string

  @ApiProperty()
  @IsString()
  created_at: string

  @ApiProperty()
  @IsString()
  amount: string
}

export type TxHistoryBridgeList = TxHistoryBridgeItem[]

export class GetLiqAddressDrainHistoryBridgeResponseDTO {
  @ApiProperty()
  @IsNumber()
  count: number

  @ApiProperty({ type: () => TxHistoryBridgeItem })
  @ValidateNested({ each: true })
  @Type(() => TxHistoryBridgeItem)
  @IsArray()
  data: TxHistoryBridgeList
}

class VirtualAccountActivityItemSourceDetailsDto {
  @ApiProperty({ description: 'The payment rail used for the transaction.', example: 'ach_push' })
  @IsString()
  @IsNotEmpty()
  payment_rail: string

  @ApiProperty({ description: 'Description of the transaction.', example: 'ACH description' })
  @IsString()
  @IsNotEmpty()
  description: string

  @ApiProperty({ description: 'The name of the sender.', example: 'The name of the business or individual who initiated the ACH' })
  @IsString()
  @IsNotEmpty()
  sender_name: string

  @ApiProperty({ description: 'The routing number of the sender bank.', example: '123456789' })
  @IsString()
  @IsNotEmpty()
  sender_bank_routing_number: string

  @ApiProperty({ description: 'A unique 15-digit trace number used for tracking.', example: '123456789012345' })
  @IsString()
  @IsNotEmpty()
  trace_number: string
}

export class VirtualAccountActivityItem {
  @ApiProperty({ description: 'Unique event identifier.', example: 'va_event_123' })
  @IsString()
  @IsNotEmpty()
  id: string

  @ApiProperty({ description: 'Customer identifier.', example: 'cust_alice' })
  @IsString()
  @IsNotEmpty()
  customer_id: string

  @ApiProperty({ description: 'Virtual account identifier.', example: 'va_123' })
  @IsString()
  @IsNotEmpty()
  virtual_account_id: string

  @ApiProperty({ description: 'Event type.', example: 'funds_received' })
  @IsString()
  @IsNotEmpty()
  type: string

  @ApiProperty({ description: 'Transaction amount.', example: '123.45' })
  @IsString()
  @IsNotEmpty()
  amount: string

  @ApiProperty({ description: 'Transaction currency.', example: 'usd' })
  @IsEnum(['usd', 'eur'])
  currency: 'usd' | 'eur'

  @ApiProperty({ description: 'Developer fee amount.', example: '0.0' })
  @IsString()
  @IsNotEmpty()
  developer_fee_amount: string

  @ApiProperty({ description: 'Exchange fee amount.', example: '0.0' })
  @IsString()
  @IsNotEmpty()
  exchange_fee_amount: string

  @ApiProperty({ description: 'Subtotal amount.', example: '123.45' })
  @IsString()
  @IsNotEmpty()
  subtotal_amount: string

  @ApiProperty({ description: 'Gas fee amount.', example: '0.0' })
  @IsString()
  @IsNotEmpty()
  gas_fee: string

  @ApiProperty({ description: 'Deposit identifier.', example: 'deposit_123' })
  @IsString()
  @IsNotEmpty()
  deposit_id: string

  @ApiProperty({ description: 'Timestamp when the event was created.', example: '2024-01-01T00:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  created_at: string

  @ApiProperty({ description: 'Source details of the transaction.', type: VirtualAccountActivityItemSourceDetailsDto })
  @ValidateNested()
  @Type(() => VirtualAccountActivityItemSourceDetailsDto)
  @IsObject()
  source: VirtualAccountActivityItemSourceDetailsDto
}

export type VirtualAccountActivity = VirtualAccountActivityItem[]

export class GetVirtualAccountActivityBridgeResponseDTO {
  @ApiProperty()
  @IsNumber()
  count: number

  @ApiProperty({ type: () => VirtualAccountActivityItem })
  @ValidateNested({ each: true })
  @Type(() => VirtualAccountActivityItem)
  @IsArray()
  data: VirtualAccountActivity
}

export class TxHistoryItem {
  @ApiProperty()
  @IsString()
  date: string

  @ApiProperty()
  @IsString()
  amount: number
}

export type TxHistoryList = TxHistoryItem[]

export class GetLiqAddressDrainHistoryResponseDTO {
  list: TxHistoryList
  totalTransferred: number
}

export class BridgeEventWebhookDTO {
  api_version: string
  event_id: string
  event_category: string
  event_type: string
  event_object_id: string
  event_object_status: string | null
  event_object: unknown
}

export class BridgeLiqAddressDrainDTO {
  id: string
  amount: string
  customer_id: string
  liquidation_address_id: string
  currency: DrainCurrency
  state: DrainState
  created_at: string
}

class VirtualAccountSourceDto {
  @ApiProperty({
    description: 'The source currency.',
    enum: ['usd', 'eur'],
    example: 'usd',
  })
  @IsEnum(['usd', 'eur'])
  currency: 'usd' | 'eur'
}

export class VirtualAccountDestinationDto {
  @ApiProperty({
    description: 'The payment rail used for the transaction.',
    type: () => String,
    example: 'base',
  })
  @IsString()
  payment_rail: string

  @ApiProperty({
    description: 'The currency of the destination.',
    enum: ['usdc', 'eurc'],
    example: 'usdc',
  })
  @IsEnum(['usdc', 'eurc'])
  currency: 'usdc' | 'eurc'

  @ApiProperty({
    description: 'The crypto wallet address that the customer wishes to receive funds at.',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @IsString()
  address: string
}

export class CreateBridgeVirtualAccountDto {
  @ApiProperty({
    description: 'Source details including the currency type.',
    example: { currency: 'usd' },
  })
  @ValidateNested()
  @Type(() => VirtualAccountSourceDto)
  @IsObject()
  source: VirtualAccountSourceDto

  @ApiProperty({
    description: 'Destination details for the transaction.',
    example: {
      payment_rail: 'base',
      currency: 'usdc',
      address: '0x1234567890abcdef1234567890abcdef12345678',
    },
  })
  @ValidateNested()
  @Type(() => VirtualAccountDestinationDto)
  @IsObject()
  destination: VirtualAccountDestinationDto

  @ApiProperty({
    description: 'Developer fee percentage.',
    example: '1.0',
  })
  developer_fee_percent: string
}

export class SourceDepositInstructionsUsDto {
  @ApiProperty({ description: 'The source currency, for US only usd', enum: ['usd'], example: 'usd' })
  @IsEnum(['usd'])
  currency: 'usd'

  @ApiProperty({ description: 'Bank beneficiary name.', example: 'John Doe' })
  @IsString()
  @IsOptional()
  bank_beneficiary_name: string | null

  @ApiProperty({ description: 'Bank beneficiary name.', example: 'John Doe' })
  @IsString()
  @IsOptional()
  bank_beneficiary_address: string | null

  @ApiProperty({ description: 'Bank name.', example: 'Bank of America' })
  @IsString()
  @IsNotEmpty()
  bank_name: string

  @ApiProperty({ description: 'Bank address.', example: '123 Main St, NY, USA' })
  @IsString()
  @IsNotEmpty()
  bank_address: string

  @ApiProperty({ description: 'Bank routing number.', example: '021000021' })
  @IsString()
  @IsNotEmpty()
  bank_routing_number: string

  @ApiProperty({ description: 'Bank account number.', example: '123456789' })
  @IsString()
  @IsNotEmpty()
  bank_account_number: string

  @ApiProperty({ description: 'Available payment rails.', example: ['ACH', 'Wire'], isArray: true })
  @IsArray()
  @IsString({ each: true })
  payment_rails: string[]

  @ApiProperty({ description: 'Available payment rails. For EUR only sepa', example: 'sepa', isArray: true })
  @IsString()
  payment_rail: string
}

export class SourceDepositInstructionsIbanDto {
  @ApiProperty({ description: 'The source currency, for IBNA only eur', enum: ['eur'], example: 'eur' })
  @IsEnum(['eur'])
  currency: 'eur'

  @ApiProperty({ description: 'Account Iban Number', example: 'X6099' })
  @IsString()
  @IsNotEmpty()
  iban: string

  @ApiProperty({ description: 'Bank BIC Number', example: 'MODRIE22XXX' })
  @IsString()
  @IsNotEmpty()
  bic: string

  @ApiProperty({ description: 'Account holder name', example: 'Bridge Building Sp.z.o.o.' })
  @IsString()
  @IsNotEmpty()
  account_holder_name: string

  @ApiProperty({ description: 'Bank name.', example: 'Bank of America' })
  @IsString()
  @IsNotEmpty()
  bank_name: string

  @ApiProperty({ description: 'Bank address.', example: '123 Main St, NY, USA' })
  @IsString()
  @IsNotEmpty()
  bank_address: string

  @ApiProperty({ description: 'Available payment rails. For EUR only sepa', example: ['sepa'], isArray: true })
  @IsArray()
  @IsString({ each: true })
  payment_rails: string[]

  @ApiProperty({ description: 'Available payment rails. For EUR only sepa', example: 'sepa', isArray: true })
  @IsString()
  payment_rail: string
}

export class CreateBridgeVirtualAccountResponseDto {
  @ApiProperty({ description: 'Unique identifier for the virtual account.', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  @IsNotEmpty()
  id: string

  @ApiProperty({ description: 'Status of the virtual account.', example: 'active' })
  @IsString()
  @IsNotEmpty()
  status: string

  @ApiProperty({ description: 'Customer identifier.', example: 'cust_abc123' })
  @IsString()
  @IsNotEmpty()
  customer_id: string

  @ApiProperty({
    oneOf: [
      { $ref: '#/components/schemas/SourceDepositInstructionsUsDto' },
      { $ref: '#/components/schemas/SourceDepositInstructionsIbanDto' },
    ],
    description: 'Banking information',
  })
  @IsOptional()
  @IsObject()
  source_deposit_instructions: SourceDepositInstructionsUsDto | SourceDepositInstructionsIbanDto

  @ApiProperty({ description: 'Destination details.', type: VirtualAccountDestinationDto })
  @ValidateNested()
  @Type(() => VirtualAccountDestinationDto)
  @IsObject()
  destination: VirtualAccountDestinationDto

  @ApiProperty({ description: 'Developer fee percentage.', example: '1.0' })
  @IsString()
  @IsNotEmpty()
  developer_fee_percent: string
}
