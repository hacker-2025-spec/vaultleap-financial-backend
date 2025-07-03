import { IsEnum, IsOptional, IsString } from 'class-validator'

import { ApiProperty } from '@nestjs/swagger'

import { ReviewStatus } from './sum-sub.types'

export class SumSubTokenResponseDTO {
  @ApiProperty()
  @IsString()
  token: string

  @ApiProperty()
  @IsString()
  userId: string
}

export class SumSubApplicantDetailDTO {
  @ApiProperty()
  @IsString()
  applicantId: string

  @ApiProperty({ required: false, type: ReviewStatus, enumName: 'ReviewStatus', enum: ReviewStatus })
  @IsOptional()
  @IsEnum(ReviewStatus)
  applicantStatus?: ReviewStatus
}

export class SumSubApplicantResponseDTO {
  @ApiProperty()
  @IsString()
  applicantId: string

  @ApiProperty()
  @IsString()
  auth0Id: string

  @ApiProperty({ required: false, type: ReviewStatus, enumName: 'ReviewStatus', enum: ReviewStatus })
  @IsOptional()
  @IsEnum(ReviewStatus)
  applicantStatus?: ReviewStatus
}
