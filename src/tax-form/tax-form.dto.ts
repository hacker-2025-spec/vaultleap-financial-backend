import { Expose } from 'class-transformer'
import { IsEnum, IsOptional, IsPositive, IsString } from 'class-validator'

import { ApiProperty } from '@nestjs/swagger'

import { TaxFormType } from '../tax-info/tax-info.types'
import { TaxUserType } from './tax-form.generator'

export class TaxFormDto {
  @ApiProperty()
  @Expose()
  @IsString()
  id: string

  @ApiProperty()
  @Expose()
  @IsString()
  vaultId: string

  @ApiProperty()
  @Expose()
  @IsString()
  s3Key: string

  @ApiProperty()
  @Expose()
  @IsString()
  shareHolderRoleAddress: string

  @ApiProperty()
  @Expose()
  @IsEnum(TaxFormType)
  formType: TaxFormType

  @ApiProperty({ required: false, type: TaxUserType, enumName: 'TaxUserType', enum: TaxUserType })
  @Expose()
  @IsOptional()
  @IsEnum(TaxUserType)
  userType?: TaxUserType

  @ApiProperty()
  @Expose()
  @IsPositive()
  taxYear: number
}

export class TaxFormVaultInfoDto extends TaxFormDto {
  @ApiProperty()
  @Expose()
  @IsString()
  projectName: string
}

export class TaxFormCreationDto {
  @ApiProperty()
  @Expose()
  @IsString()
  auth0Id: string

  @ApiProperty()
  @Expose()
  @IsString()
  vaultId: string

  @ApiProperty()
  @Expose()
  @IsString()
  s3Key: string

  @ApiProperty()
  @Expose()
  @IsString()
  shareHolderRoleAddress: string

  @ApiProperty()
  @Expose()
  @IsEnum(TaxFormType)
  formType: TaxFormType

  @ApiProperty({ required: false, type: TaxUserType, enumName: 'TaxUserType', enum: TaxUserType })
  @Expose()
  @IsOptional()
  @IsEnum(TaxUserType)
  userType?: TaxUserType

  @ApiProperty()
  @Expose()
  @IsPositive()
  taxYear: number
}

export class TaxForm1099CreationDto {
  @ApiProperty()
  @Expose()
  @IsString()
  vaultId: string

  @ApiProperty()
  @Expose()
  @IsString()
  payerAuth0Id: string

  @ApiProperty()
  @Expose()
  @IsString()
  recipientAuth0Id: string

  @ApiProperty()
  @Expose()
  @IsString()
  payerName: string

  @ApiProperty()
  @Expose()
  @IsString()
  recipientName: string

  @ApiProperty()
  @Expose()
  @IsString()
  shareHolderRoleAddress: string

  @ApiProperty()
  @Expose()
  @IsPositive()
  taxYear: number
}

export class RequestTaxFormAccessResponseDto {
  @ApiProperty()
  @IsString()
  status: string
}

export class AccessTaxFormDto {
  @ApiProperty()
  @IsString()
  securityCode: string
}

export class AccessTaxFormResponseDto {
  @ApiProperty()
  @IsString()
  s3Key: string

  @ApiProperty()
  @IsString()
  downloadUrl: string
}
