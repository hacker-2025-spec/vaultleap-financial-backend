import { IsBoolean, IsOptional, IsString, IsEthereumAddress } from 'class-validator'

import { ApiProperty } from '@nestjs/swagger'
import { CustomerEntity } from '../customers/customers.entity'
import { BridgeKYCEntity } from '../bridge-kyc/bridge-kyc.entity'

export class UserResponseDTO {
  @ApiProperty()
  @IsString()
  auth0Id: string

  @ApiProperty()
  @IsString()
  email: string

  @ApiProperty()
  @IsString()
  @IsOptional()
  name: string

  @ApiProperty()
  @IsBoolean()
  isPremium: boolean

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  avatar?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  avatarS3Key?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  customer?: CustomerEntity

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  bridgeKyc?: BridgeKYCEntity

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  countryOfResidence?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  privyWalletAddress?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  privySmartWalletAddress?: string
}

export class UpdateUserDetailsDTO {
  @ApiProperty()
  @IsString()
  name: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  entityName?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  jurisdiction?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  registrationId?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  countryOfResidence?: string
}

export class UpdateUserAvatarDto {
  @ApiProperty()
  @IsString()
  avatar: string
}

export class UpdatePrivyWalletAddressesDto {
  @ApiProperty({
    description: 'Privy wallet address (EOA wallet)',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @IsEthereumAddress({ message: 'Invalid Ethereum address format for Privy wallet' })
  @IsString()
  privyWalletAddress: string

  @ApiProperty({
    description: 'Privy smart wallet address (smart contract wallet)',
    example: '0xabcdef1234567890abcdef1234567890abcdef12',
  })
  @IsEthereumAddress({ message: 'Invalid Ethereum address format for Privy smart wallet' })
  @IsString()
  privySmartWalletAddress: string
}
