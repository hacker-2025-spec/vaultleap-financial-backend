import { IsOptional, IsString } from 'class-validator'

import { ApiProperty } from '@nestjs/swagger'

export class AuditAccessEventDto {
  @ApiProperty()
  @IsString()
  timestamp: string

  @ApiProperty()
  @IsString()
  action: string

  @ApiProperty()
  @IsString()
  status: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ip: string
}
