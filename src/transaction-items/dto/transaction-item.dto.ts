import { IsString, IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { TransactionSource } from '../transaction-item.entity'

export enum TypeFilter {
  FUNDS_RECEIVED = 'funds_received',
  FUNDS_SENT = 'funds_sent',
}
export class GetTransactionItemsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @ApiPropertyOptional({
    description: 'Max number of items to return per page',
    default: 20,
    example: 20,
  })
  limit?: number = 20

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Base64-encoded cursor for paginated results (from previous nextCursor)',
    example: 'eyJpZCI6InRyYW5zYWN0aW9uSWQifQ==',
  })
  cursor?: string

  @IsOptional()
  @IsEnum(TypeFilter)
  @ApiPropertyOptional({ description: 'Filter by transaction type', example: TypeFilter.FUNDS_RECEIVED })
  type?: TypeFilter

  @IsOptional()
  @IsEnum(TransactionSource)
  @ApiPropertyOptional({ enum: TransactionSource, description: 'Filter by transaction source' })
  source?: TransactionSource

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Filter by transaction currency code', example: 'USD' })
  currency?: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Filter by virtual account ID', example: 'va_abc123' })
  virtualAccountId?: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Filter by transactions occurring after this date (ISO format)',
    example: '2024-01-01T00:00:00.000Z',
  })
  startDate?: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Filter by transactions occurring before this date (ISO format)',
    example: '2024-12-31T23:59:59.999Z',
  })
  endDate?: string
}

export class TransactionItemResponseDto {
  @ApiProperty({ description: 'Globally unique ID for the transaction item' })
  id: string

  @ApiProperty({ enum: TransactionSource, description: 'Source of the transaction' })
  source: TransactionSource

  @ApiProperty({ description: 'ID from the originating system' })
  sourceEventId?: string

  @ApiProperty()
  customerId: string

  @ApiProperty()
  virtualAccountId?: string

  @ApiProperty({ enum: ['funds_received', 'payment_submitted', 'refund', 'funds_sent'] })
  type: string

  @ApiProperty({ description: 'Amount in decimal' })
  amount?: number

  @ApiProperty()
  currency?: string

  @ApiProperty({ description: 'Developer fee amount' })
  developerFeeAmount?: number

  @ApiProperty({ description: 'Exchange fee amount' })
  exchangeFeeAmount?: number

  @ApiProperty({ description: 'Deposit ID' })
  depositId?: string

  @ApiProperty({ description: 'Transaction description' })
  description?: string

  @ApiProperty({ description: 'Name of the sender' })
  senderName?: string

  @ApiProperty({ description: 'Trace number or IMAD' })
  traceNumber?: string

  @ApiProperty({ description: 'From Address' })
  fromAddress?: string

  @ApiProperty({ description: 'To Address' })
  toAddress?: string

  @ApiProperty({ description: 'Hash of the transaction' })
  hash?: string

  @ApiProperty({ description: 'Network of the transaction' })
  network?: string

  senderAuth0Id?: string

  receiverAuth0Id?: string

  @ApiProperty()
  senderUser?: any

  @ApiProperty()
  receiverUser?: any

  @ApiProperty({ description: 'Transaction date' })
  occurredAt: number

  @ApiProperty()
  createdAt?: Date

  @ApiProperty()
  updatedAt?: Date
}

export class GetTransactionItemsResponseDto {
  @ApiProperty({
    type: [TransactionItemResponseDto],
    description: 'List of paginated transaction items for the current page',
  })
  items: TransactionItemResponseDto[]

  @ApiProperty({
    description: 'Number of items returned in this page',
    example: 20,
  })
  limit: number

  @ApiProperty({
    description: 'Number of items returned in this page',
    example: 17,
  })
  count: number

  @ApiPropertyOptional({
    description: 'Base64-encoded cursor for fetching the next page. Pass this as `cursor` in the next request.',
    example: 'eyJpZCI6InR4XzEyMzQ1NiJ9',
  })
  nextCursor?: string | null
}
