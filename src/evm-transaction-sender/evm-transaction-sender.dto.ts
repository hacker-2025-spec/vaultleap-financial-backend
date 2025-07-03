import { IsEnum, IsEthereumAddress, IsHexadecimal } from 'class-validator'

import { ApiProperty } from '@nestjs/swagger'

import { TRANSACTION_TYPE_RECIPIENT } from './evm-transaction-sender.types'

export class SendEvmTransactionDto {
  @ApiProperty({
    type: TRANSACTION_TYPE_RECIPIENT,
    required: true,
    enumName: 'TRANSACTION_TYPE',
    enum: TRANSACTION_TYPE_RECIPIENT,
  })
  @IsEnum(TRANSACTION_TYPE_RECIPIENT)
  transactionType: TRANSACTION_TYPE_RECIPIENT

  @ApiProperty()
  @IsEthereumAddress()
  to: string

  @ApiProperty()
  @IsHexadecimal()
  data: string
}
