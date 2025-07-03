import { IsEnum, IsArray, IsNumber, IsString, IsBoolean, IsOptional } from 'class-validator'

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

import { TRANSACTION_STATUS } from '../evm-transaction-sender/evm-transaction-sender.types'

export class VaultTransactionStatusDTO {
  @ApiProperty({ type: TRANSACTION_STATUS, required: true, enumName: 'TRANSACTION_STATUS', enum: TRANSACTION_STATUS })
  @IsOptional()
  @IsEnum(TRANSACTION_STATUS)
  status: TRANSACTION_STATUS
}

export class SelfManagedVaultTransactionStatusDTO extends VaultTransactionStatusDTO {
  @ApiPropertyOptional({
    type: 'object',
    properties: {
      a: { type: 'string' },
      p: { type: 'string' },
    },
  })
  info?: {
    a?: string
    p?: string
  }
}

export class TShareRoleDto {
  @ApiProperty()
  @IsString()
  name: string

  @ApiProperty()
  @IsNumber()
  sharePercentage: number

  @ApiProperty()
  @IsArray()
  emails: string[]

  @ApiProperty()
  @IsNumber()
  count: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  shareHolderRoleAddress: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  totalIncome: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  watching: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  taxInfoProvided: boolean
}

export class VaultDefaultDto {
  @ApiProperty()
  @IsString()
  userId: string

  @ApiProperty()
  @IsString()
  projectName: string

  @ApiProperty({ type: TShareRoleDto, isArray: true })
  @IsArray()
  roles: TShareRoleDto[]

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  profitSwitchName?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  profitSwitchAmount?: number

  @ApiProperty({ required: false })
  @IsOptional()
  profitSwitchAddress?: string

  @ApiProperty()
  @IsString()
  ownerName: string

  @ApiProperty()
  @IsString()
  ownerEmail: string

  @ApiProperty()
  @IsString()
  adminWalletAddress: string

  @ApiProperty()
  @IsNumber()
  vaultFeePercentage: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  taxFormEnabled: boolean

  @ApiProperty()
  @IsBoolean()
  agreeToTOSAndPP: boolean
}

export class VaultCreationDto extends VaultDefaultDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  businessName?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  city?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  state?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  country?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  zip?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tinSsn?: string
}

export class VaultDto extends VaultDefaultDto {
  @ApiProperty()
  id: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  vaultAddress?: string

  @ApiProperty()
  @IsBoolean()
  watching: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  currentFunds?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  totalPaid?: string

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  alreadyClaimed?: boolean

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  tokenAddress?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  tokenId?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  walletAddress?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  claimable?: string

  @ApiProperty()
  @IsString()
  shareholderManagerAddress: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  transactionHash?: string

  @ApiProperty({ type: TRANSACTION_STATUS, required: false, enumName: 'TRANSACTION_STATUS', enum: TRANSACTION_STATUS })
  @IsOptional()
  @IsEnum(TRANSACTION_STATUS)
  transactionStatus?: TRANSACTION_STATUS

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  selfManaged?: boolean
}

export class VaultKeysDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  @IsString()
  projectName: string

  @ApiProperty({ type: TShareRoleDto, isArray: true })
  @IsArray()
  roles: TShareRoleDto[]

  @ApiProperty()
  @IsNumber()
  vaultFeePercentage: number

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  vaultAddress?: string

  @ApiProperty()
  @IsNumber()
  amount: number

  @ApiProperty()
  @IsString()
  tokenAddress: string

  @ApiProperty()
  @IsString()
  tokenId: string

  @ApiProperty()
  @IsString()
  walletAddress: string

  @ApiProperty()
  @IsString()
  claimable: string
}

export class TVaultFundsStatisticDto {
  @ApiProperty()
  @IsString()
  amount: string

  @ApiProperty()
  @IsString()
  date: string
}

export class VaultInfoDto extends VaultDto {
  @ApiProperty({ type: TVaultFundsStatisticDto, isArray: true })
  @IsArray()
  vaultFundsStatistics: TVaultFundsStatisticDto[]
}

export class UpdateRoleEmailDto {
  @ApiProperty()
  @IsString()
  tokenAddress: string
}

export class SignVaultTransactionDto {
  @ApiProperty()
  @IsString()
  vaultId: string

  @ApiProperty()
  @IsString()
  p: string

  @ApiProperty()
  @IsString()
  address: string
}

export class SignVaultTransactionResultDto {
  @ApiProperty({ required: false })
  @IsOptional()
  signature?: string
}
