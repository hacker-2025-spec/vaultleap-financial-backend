import { IsString, MaxLength, IsNotEmpty, IsOptional } from 'class-validator'

export class CreateFundingNoteDTO {
  @IsString()
  @IsNotEmpty()
  transactionHash: string

  @IsString()
  @IsNotEmpty()
  vaultId: string

  @IsOptional()
  @MaxLength(300)
  note?: string
}
