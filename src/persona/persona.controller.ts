import { Body, Controller, Patch, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger'

import { BaseUserGuard } from '../auth/baseUser.guard'
import { PersonaService } from './persona.service'
import { PersonaApplicantDetailDTO, PersonaApplicantResponseDTO, PersonaInquiryIdResponseDTO } from './persona.dto'
import { UserContext } from '../users/users.decorator'
import { UsersEntity } from '../users/users.entity'

@ApiTags('persona')
@UseGuards(BaseUserGuard)
@Controller('persona')
@ApiBearerAuth()
export class PersonaController {
  constructor(public personaService: PersonaService) {}

  @Post('/create-inquiry-id')
  @ApiResponse({ type: PersonaInquiryIdResponseDTO, status: 200 })
  async createInquiryId(@UserContext() user: UsersEntity): Promise<PersonaInquiryIdResponseDTO> {
    return await this.personaService.createInquiryId(user.auth0Id)
  }

  @Patch('/update-applicant')
  @ApiResponse({ type: PersonaApplicantResponseDTO, status: 200 })
  async updateApplicant(
    @UserContext() user: UsersEntity,
    @Body() applicantDetails: PersonaApplicantDetailDTO
  ): Promise<PersonaApplicantResponseDTO> {
    return await this.personaService.updateApplicant(user.auth0Id, applicantDetails)
  }
}
