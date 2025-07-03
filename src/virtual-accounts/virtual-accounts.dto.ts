import { IsObject, IsString, IsOptional, IsNumberString, IsEnum, ValidateNested, IsEthereumAddress, IsBoolean } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { CreateBridgeVirtualAccountDto } from '../bridge-xyz/bridge-xyz.dto'
import type { CreateUsExternalAccountDTO, CreateIbanExternalAccountDTO } from '../bridge-xyz/bridge-xyz.dto'
import { LiquidationChain, LiquidationCurrency, FiatCurrency, PaymentRail } from '../bridge-xyz/bridge-xyz.types'

export enum TransferType {
  BRIDGE = 'bridge',
  DIRECT_WEB3 = 'direct_web3'
}

export class CreateVirtualAccountDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Bridge customer ID' })
  @IsString()
  bridgeCustomerId: string

  @ApiProperty({
    type: () => CreateBridgeVirtualAccountDto,
    description: 'virtual account information',
  })
  @IsObject()
  virtualAccountData: CreateBridgeVirtualAccountDto

  @ApiProperty({ example: 'My Direct vault' })
  @IsString()
  vaultName: string
}

export class VirtualAccountActivityQueryDto {
  @ApiProperty({
    description: 'Maximum number of items to return per page',
    example: 20,
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  limit?: string

  @ApiProperty({
    description: 'ID to start pagination after',
    example: 'va_event_123',
    required: false,
  })
  @IsOptional()
  @IsString()
  startingAfterId?: string

  @ApiProperty({
    description: 'ID to end pagination before',
    example: 'va_event_456',
    required: false,
  })
  @IsOptional()
  @IsString()
  endingBeforeId?: string

  @ApiProperty({
    description: 'Filter by event type',
    example: 'funds_received',
    required: false,
  })
  @IsOptional()
  @IsString()
  eventType?: string
}

export class CreateUnifiedAccountDto {
  @ApiProperty({ example: 'My Vault', description: 'Name for the vault/account' })
  @IsString()
  vaultName: string

  @ApiProperty({
    example: 'bridge',
    description: 'Transfer type - bridge for traditional Bridge flow, direct_web3 for direct Web3 transfers',
    enum: Object.values(TransferType),
    default: TransferType.BRIDGE,
  })
  @IsEnum(TransferType)
  transferType: TransferType

  @ApiProperty({ example: '1.5', description: 'Developer fee percentage', required: false })
  @IsOptional()
  @IsString()
  feePercentage?: string

  @ApiProperty({
    example: 'base',
    description: 'Blockchain chain',
    enum: Object.values(LiquidationChain),
    default: LiquidationChain.BASE,
  })
  @IsOptional()
  @IsEnum(LiquidationChain)
  chain?: LiquidationChain

  @ApiProperty({
    example: 'usdc',
    description: 'Currency type',
    enum: Object.values(LiquidationCurrency),
    default: LiquidationCurrency.USDC,
  })
  @IsOptional()
  @IsEnum(LiquidationCurrency)
  currency?: LiquidationCurrency

  @ApiProperty({
    example: 'base',
    description: 'Payment rail for destination',
    enum: Object.values(PaymentRail),
  })
  @IsOptional()
  @IsEnum(PaymentRail)
  destinationPaymentRail?: PaymentRail

  @ApiProperty({
    example: 'usdc',
    description: 'Destination currency',
    enum: [...Object.values(FiatCurrency), ...Object.values(LiquidationCurrency)],
  })
  @IsOptional()
  @IsEnum([...Object.values(FiatCurrency), ...Object.values(LiquidationCurrency)])
  destinationCurrency?: FiatCurrency | LiquidationCurrency

  @ApiProperty({
    example: '0x1234567890abcdef1234567890abcdef12345678',
    description: 'Destination address for crypto payments (required for direct Web3 transfers)',
    required: false,
  })
  @IsOptional()
  @IsEthereumAddress({ message: 'Invalid Ethereum address format' })
  destinationAddress?: string

  @ApiProperty({
    oneOf: [{ $ref: '#/components/schemas/CreateUsExternalAccountDTO' }, { $ref: '#/components/schemas/CreateIbanExternalAccountDTO' }],
    description: 'Banking information (required for fiat destinations)',
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  bankingInfo?: CreateUsExternalAccountDTO | CreateIbanExternalAccountDTO

  @ApiProperty({
    example: 'Payment for services',
    description: 'Wire message for wire transfers',
    required: false,
  })
  @IsOptional()
  @IsString()
  destinationWireMessage?: string

  @ApiProperty({
    example: 'SEPA-REF-123',
    description: 'SEPA reference for SEPA transfers',
    required: false,
  })
  @IsOptional()
  @IsString()
  destinationSepaReference?: string
}

export class GetUnifiedAccountsQueryDto {
  @ApiProperty({
    example: 'bridge',
    description: 'Filter by transfer type',
    enum: Object.values(TransferType),
    required: false,
  })
  @IsOptional()
  @IsEnum(TransferType)
  transferType?: TransferType

  @ApiProperty({
    example: 'My Vault',
    description: 'Filter by vault name',
    required: false,
  })
  @IsOptional()
  @IsString()
  vaultName?: string
}
