import { IsArray, IsNumber, IsEnum, IsString } from 'class-validator'

import { ApiProperty } from '@nestjs/swagger'

export class PaymasterServiceRequestDto {
  @ApiProperty()
  @IsString()
  @IsEnum(['2.0'])
  jsonrpc: string

  @ApiProperty()
  @IsNumber()
  id: number

  @ApiProperty()
  @IsString()
  @IsEnum(['pm_getPaymasterStubData', 'pm_getPaymasterData'])
  method: string

  @ApiProperty()
  @IsArray()
  params: unknown[]
}

export class PaymasterServiceResponseDto {}
