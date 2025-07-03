import { IsObject, IsOptional, IsString, ValidateNested, IsBoolean, IsEthereumAddress } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import type { CreateUsExternalAccountDTO, CreateIbanExternalAccountDTO } from '../bridge-xyz/bridge-xyz.dto'
import { CreateCustomerFromKycDTO } from '../bridge-xyz/bridge-xyz.dto'

export class CreateCustomerDTO {
  @ApiProperty({ type: () => CreateCustomerFromKycDTO, description: 'Customer details from KYC' })
  @ValidateNested()
  @Type(() => CreateCustomerFromKycDTO)
  @IsObject()
  customer: CreateCustomerFromKycDTO

  @ApiProperty({
    description: 'Privy wallet address (EOA wallet)',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @IsEthereumAddress({ message: 'Invalid Ethereum address format for Privy wallet' })
  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase() : value))
  @IsString()
  privyWalletAddress: string

  @ApiProperty({
    description: 'Privy smart wallet address (smart contract wallet)',
    example: '0xabcdef1234567890abcdef1234567890abcdef12',
  })
  @IsEthereumAddress({ message: 'Invalid Ethereum address format for Privy smart wallet' })
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase() : value))
  privySmartWalletAddress: string

  @ApiProperty({
    description: 'Indicates that the user has accepted the terms of service in your application',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  tosAccepted?: boolean = true

  @ApiProperty({
    description: 'Internal identifier for the signed TOS agreement that can be used for attestation',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  signedAgreementId?: string

  @ApiProperty({
    description: 'Indicates that the developer has accepted the terms of service on behalf of the user',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  developer_accepted_tos?: boolean = true
}

export class CreateBankingInfoDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Bridge customer ID' })
  @IsString()
  bridgeCustomerId: string

  @ApiProperty({
    oneOf: [{ $ref: '#/components/schemas/CreateUsExternalAccountDTO' }, { $ref: '#/components/schemas/CreateIbanExternalAccountDTO' }],
    description: 'Banking information',
  })
  @IsOptional()
  @IsObject()
  bankingInfo: CreateUsExternalAccountDTO | CreateIbanExternalAccountDTO
}

export class CheckKycStatusDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Bridge.xyz`s KYC Link Identifier' })
  @IsString()
  bridgeKYCId: string
}

export class CreateLiquidationAddressShortDTO {
  @ApiProperty({ example: '0.5', description: 'Percent of the fee' })
  @IsString()
  percentage: string

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Bridge external account Id, from bankin-info entity' })
  @IsString()
  bridgeExternalAccountId: string

  @ApiProperty({ example: 'My Direct vault' })
  @IsString()
  vaultName: string
}

export class GetLiqAddressDrainHistoryDTO {
  @ApiProperty()
  @IsString()
  liqAddressId: string
}
