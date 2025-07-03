import { IsEnum, IsString } from 'class-validator'
import { PersonaReviewStatus } from './persona.types'
import { ApiProperty } from '@nestjs/swagger'

export class PersonaApplicantDetailDTO {
  @ApiProperty({ required: true, type: PersonaReviewStatus, enumName: 'PersonaReviewStatus', enum: PersonaReviewStatus })
  @IsEnum(PersonaReviewStatus)
  applicantStatus: PersonaReviewStatus
}

export class PersonaInquiryIdResponseDTO {
  @ApiProperty()
  @IsString()
  inquiryId: string
}

export class PersonaApplicantResponseDTO {
  @ApiProperty()
  @IsString()
  id: string

  @ApiProperty()
  @IsString()
  auth0Id: string

  @ApiProperty({ required: true, type: PersonaReviewStatus, enumName: 'PersonaReviewStatus', enum: PersonaReviewStatus })
  @IsEnum(PersonaReviewStatus)
  applicantStatus: PersonaReviewStatus
}
