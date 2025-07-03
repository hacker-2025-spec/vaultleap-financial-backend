import { Type } from 'class-transformer'
import { IsArray, IsBoolean, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator'

import { ApiProperty } from '@nestjs/swagger'
import { TaxFormType } from '../tax-info/tax-info.types'
import { TaxInfo1099FormDto } from '../tax-info/tax-info.dto'

import { VaultsCreationStatus } from './vaults-creator.types'
import { CreatorVaultDto } from './creator-vault.dto'

export class VaultsCreationStatusDto {
  @ApiProperty({ type: VaultsCreationStatus, enumName: 'VaultsCreationStatus', enum: VaultsCreationStatus })
  @IsEnum(VaultsCreationStatus)
  status: VaultsCreationStatus
}

export class TaxInfoVaultsConfigDto {
  @ApiProperty()
  @IsString()
  email: string

  @ApiProperty({ type: TaxFormType, enumName: 'TaxFormType', enum: TaxFormType })
  @IsEnum(TaxFormType)
  formType: TaxFormType

  @ApiProperty({ type: TaxInfo1099FormDto })
  @ValidateNested()
  @Type(() => TaxInfo1099FormDto)
  t1099FormDetails: TaxInfo1099FormDto
}

export class VaultsCreatorConfigDto {
  @ApiProperty({ type: CreatorVaultDto, isArray: true })
  @IsArray()
  vaults: CreatorVaultDto[]

  @ApiProperty()
  @IsBoolean()
  taxFormEnabled: boolean

  @ApiProperty({ required: false, type: TaxInfoVaultsConfigDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => TaxInfoVaultsConfigDto)
  ownerTaxInfo: TaxInfoVaultsConfigDto
}

export class VaultsCreatorDto {
  @ApiProperty()
  @IsString()
  id: string

  @ApiProperty()
  @IsString()
  auth0Id: string

  @ApiProperty({ type: CreatorVaultDto, isArray: true })
  @IsArray()
  vaults: CreatorVaultDto[]

  @ApiProperty({ type: VaultsCreationStatus, enumName: 'VaultsCreationStatus', enum: VaultsCreationStatus })
  @IsEnum(VaultsCreationStatus)
  creationStatus: VaultsCreationStatus
}
