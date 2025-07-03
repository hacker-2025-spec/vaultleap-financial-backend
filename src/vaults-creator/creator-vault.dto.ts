import { VaultDefaultDto } from '../vault/vault.dto'
import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator'
import { TRANSACTION_STATUS } from '../evm-transaction-sender/evm-transaction-sender.types'

export class CreatorVaultDto extends VaultDefaultDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  id?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  vaultAddress?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  watching?: boolean

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  walletAddress?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  shareholderManagerAddress?: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  transactionHash?: string

  @ApiProperty({ type: TRANSACTION_STATUS, required: false, enumName: 'TRANSACTION_STATUS', enum: TRANSACTION_STATUS })
  @IsOptional()
  @IsEnum(TRANSACTION_STATUS)
  transactionStatus?: TRANSACTION_STATUS
}
