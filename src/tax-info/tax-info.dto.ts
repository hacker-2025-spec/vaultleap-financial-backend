import { Type } from 'class-transformer'
import { IsBoolean, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator'

import { ApiProperty } from '@nestjs/swagger'

import { VaultDto } from '../vault/vault.dto'

import {
  FATCAStatus,
  TaxFormType,
  TrusteeCountry,
  EntityFATCAStatus,
  TaxTreatyBenefits,
  SponsoredFIICertify,
  FedTaxClassification,
  IdentificationStatus,
} from './tax-info.types'

export class TaxInfo1099FormDto {
  @ApiProperty()
  @IsString()
  businessName: string

  @ApiProperty()
  @IsString()
  address: string

  @ApiProperty()
  @IsString()
  city: string

  @ApiProperty()
  @IsString()
  state: string

  @ApiProperty()
  @IsString()
  country: string

  @ApiProperty()
  @IsString()
  zip: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ssn?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ein?: string
}

export class TaxInfoW9FormDto {
  @ApiProperty()
  @IsString()
  fullName: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  businessName?: string

  @ApiProperty({ type: FedTaxClassification, enumName: 'FedTaxClassification', enum: FedTaxClassification })
  @IsEnum(FedTaxClassification)
  fedTaxClassification: FedTaxClassification

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  llcClassification?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  otherClassification?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  payeeCode?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  exemptionCode?: string

  @ApiProperty()
  @IsString()
  address: string

  @ApiProperty()
  @IsString()
  city: string

  @ApiProperty()
  @IsString()
  state: string

  @ApiProperty()
  @IsString()
  country: string

  @ApiProperty()
  @IsString()
  zip: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ssn?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ein?: string

  @ApiProperty()
  @IsBoolean()
  readAndUnderstand: boolean

  @ApiProperty()
  @IsString()
  signature: string

  @ApiProperty()
  @IsString()
  date: string

  @ApiProperty()
  @IsBoolean()
  consent: boolean
}

export class TaxInfoW8BenFormDto {
  @ApiProperty()
  @IsString()
  ownerName: string

  @ApiProperty()
  @IsString()
  citizenshipCountry: string

  @ApiProperty()
  @IsString()
  address: string

  @ApiProperty()
  @IsString()
  city: string

  @ApiProperty()
  @IsString()
  country: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  mailingAddress?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  mailingCity?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  mailingCountry?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  usTaxId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  foreignTaxId?: string

  @ApiProperty()
  @IsBoolean()
  ftinNotRequired: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  referenceNumbers?: string

  @ApiProperty()
  @IsString()
  dateOfBirth: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  countryOfTaxTreaty?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  treatyArticle?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  paragraph?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  withholdingRate?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  typeOfIncome?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  additionalConditions?: string

  @ApiProperty()
  @IsBoolean()
  certify: boolean

  @ApiProperty()
  @IsBoolean()
  readAndUnderstand: boolean

  @ApiProperty()
  @IsString()
  signature: string

  @ApiProperty()
  @IsString()
  signerName: string

  @ApiProperty()
  @IsString()
  date: string

  @ApiProperty()
  @IsBoolean()
  consent: boolean
}

export class TaxInfoW8BenEFormDto {
  @ApiProperty()
  @IsString()
  organizationName: string

  @ApiProperty()
  @IsString()
  countryOfIncorporation: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  disregardedEntityName?: string

  @ApiProperty({ type: IdentificationStatus, enumName: 'IdentificationStatus', enum: IdentificationStatus })
  @IsEnum(IdentificationStatus)
  status: IdentificationStatus

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isTreatyClaim?: boolean

  @ApiProperty({ type: FATCAStatus, enumName: 'FATCAStatus', enum: FATCAStatus })
  @IsEnum(FATCAStatus)
  fatcaStatus: FATCAStatus

  @ApiProperty()
  @IsString()
  permanentResidenceAddress: string

  @ApiProperty()
  @IsString()
  permanentResidenceCity: string

  @ApiProperty()
  @IsString()
  permanentResidenceCountry: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  mailingAddress?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  mailingCity?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  mailingCountry?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  usTaxId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  giin?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  foreignTaxId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  ftinNotRequired?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  referenceNumbers?: string

  @ApiProperty({ required: false, type: EntityFATCAStatus, enumName: 'EntityFATCAStatus', enum: EntityFATCAStatus })
  @IsOptional()
  @IsEnum(EntityFATCAStatus)
  entityFatcaStatus?: EntityFATCAStatus

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  entityAddress?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  entityCity?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  entityCountry?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  entityGiin?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  certificateTaxTreatyA?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  certificateTaxTreatyACountry?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  certificateTaxTreatyB?: boolean

  @ApiProperty({ required: false, type: TaxTreatyBenefits, enumName: 'TaxTreatyBenefits', enum: TaxTreatyBenefits })
  @IsOptional()
  @IsEnum(TaxTreatyBenefits)
  certificateTaxTreatyBBenefit?: TaxTreatyBenefits

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  certificateTaxTreatyBOther?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  certificateTaxTreatyC?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ratesTreatyArticle?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ratesParagraph?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ratesWithholdingRate?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ratesTypeOfIncome?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ratesAdditionalConditions?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sponsoringEntityName?: string

  @ApiProperty({ required: false, type: SponsoredFIICertify, enumName: 'SponsoredFIICertify', enum: SponsoredFIICertify })
  @IsOptional()
  @IsEnum(SponsoredFIICertify)
  sponsoringEntityCertify?: SponsoredFIICertify

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  certify18?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  certify19?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sponsoringEntityNamePartVII?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  certify21?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  certify22?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  certify23?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  certify24A?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  certify24B?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  certify24C?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  certify24D?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  certify25A?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  certify25B?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  certify25C?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  certify26?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  country26?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  institutionType26?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  model1Iga26?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  model2Iga26?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  trusteeName26?: string

  @ApiProperty({ required: false, type: TrusteeCountry, enumName: 'TrusteeCountry', enum: TrusteeCountry })
  @IsOptional()
  @IsEnum(TrusteeCountry)
  trusteeCountry26?: TrusteeCountry

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  certify27?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  certify28A?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  certify28B?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  certify29A?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  certify29B?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  certify29C?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  certify29D?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  certify29E?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  certify29F?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  certify30?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  certify31?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  certify32?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  certify33?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  date33?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  certify34?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  date34?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  certify35?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  date35?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  certify36?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  certify37A?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  exchange37A?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  certify37B?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name37B?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  securities37B?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  certify38?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  certify39?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  certify40A?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  certify40B?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  certify40C?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  certify41?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name42?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  certify43?: boolean

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name1Part44?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address1Part44?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tin1Part44?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name2Part44?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address2Part44?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tin2Part44?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name3Part44?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address3Part44?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tin3Part44?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name4Part44?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address4Part44?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tin4Part44?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name5Part44?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address5Part44?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tin5Part44?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name6Part44?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address6Part44?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tin6Part44?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name7Part44?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address7Part44?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tin7Part44?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name8Part44?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address8Part44?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tin8Part44?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name9Part44?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address9Part44?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tin9Part44?: string

  @ApiProperty()
  @IsBoolean()
  certify: boolean

  @ApiProperty()
  @IsString()
  signature: string

  @ApiProperty()
  @IsString()
  signerName: string

  @ApiProperty()
  @IsString()
  date: string

  @ApiProperty()
  @IsBoolean()
  consent: boolean
}

export class TaxInfoCreationDto {
  @ApiProperty()
  @IsString()
  vaultId: string

  @ApiProperty()
  @IsString()
  email: string

  @ApiProperty({ type: TaxFormType, enumName: 'TaxFormType', enum: TaxFormType })
  @IsEnum(TaxFormType)
  formType: TaxFormType

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  shareHolderRoleAddress?: string

  @ApiProperty({ required: false, type: TaxInfo1099FormDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => TaxInfo1099FormDto)
  t1099FormDetails?: TaxInfo1099FormDto

  @ApiProperty({ required: false, type: TaxInfoW9FormDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => TaxInfoW9FormDto)
  w9FormDetails?: TaxInfoW9FormDto

  @ApiProperty({ required: false, type: TaxInfoW8BenFormDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => TaxInfoW8BenFormDto)
  w8BenFormDetails?: TaxInfoW8BenFormDto

  @ApiProperty({ required: false, type: TaxInfoW8BenEFormDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => TaxInfoW8BenEFormDto)
  w8BenEFormDetails?: TaxInfoW8BenEFormDto
}

export class TaxInfoDto extends TaxInfoCreationDto {
  @ApiProperty()
  @IsString()
  id: string

  @ApiProperty()
  @IsString()
  auth0Id: string
}

export class VaultWithTaxInfoDto {
  @ApiProperty({ type: VaultDto })
  @ValidateNested()
  @Type(() => VaultDto)
  vaultInfo: VaultDto

  @ApiProperty({ required: false, type: TaxInfoDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => TaxInfoDto)
  taxInfo?: TaxInfoDto
}
