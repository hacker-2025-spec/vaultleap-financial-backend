import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator'

export class CreateSupportTicketDto {
  @ApiProperty({ type: String, example: 'Mohamed', required: true })
  @IsNotEmpty()
  name!: string

  @ApiProperty({ type: String, example: 'email@email.com', required: true })
  @IsEmail()
  @MaxLength(120)
  email!: string

  @ApiProperty({ type: String, example: 'I need Help', required: true })
  @IsNotEmpty()
  @MaxLength(120)
  subject!: string

  @ApiProperty({ type: String, example: 'message body', required: true })
  @IsNotEmpty()
  message!: string
}
