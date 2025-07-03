import { IsString } from 'class-validator'

import { ApiProperty } from '@nestjs/swagger'

export class AdminDetailsDto {
  @ApiProperty()
  @IsString()
  walletAddress: string
}
