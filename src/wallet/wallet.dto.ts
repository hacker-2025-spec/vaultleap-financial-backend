import { IsDate, IsEnum, IsString } from 'class-validator'

import { ApiProperty } from '@nestjs/swagger'

import { WALLET_TYPE } from './wallet.type'
import { WALLET_STATUS } from './wallet.enum'

export class WalletDto {
  @ApiProperty()
  @IsString()
  address: string

  @ApiProperty()
  @IsString()
  auth0Id: string

  @ApiProperty()
  @IsDate()
  createdAt: Date

  @ApiProperty({ type: WALLET_TYPE, enumName: 'WALLET_TYPE', enum: WALLET_TYPE })
  @IsEnum(WALLET_TYPE)
  walletType: WALLET_TYPE
}

export class WalletCreationDto {
  @ApiProperty()
  @IsString()
  address: string

  @ApiProperty()
  @IsEnum(WALLET_TYPE)
  walletType: WALLET_TYPE
}

export class WalletStatusDto {
  @ApiProperty({ type: WALLET_STATUS, enumName: 'WALLET_STATUS', enum: WALLET_STATUS })
  @IsEnum(WALLET_STATUS)
  status: WALLET_STATUS
}
