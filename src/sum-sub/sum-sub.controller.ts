import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'

import { UsersEntity } from '../users/users.entity'
import { BaseUserGuard } from '../auth/baseUser.guard'
import { UserContext } from '../users/users.decorator'

import { SumSubService } from './sum-sub.service'
import { SumSubApplicantResponseDTO, SumSubApplicantDetailDTO, SumSubTokenResponseDTO } from './sum-sub.dto'

@ApiTags('SumSub')
@UseGuards(BaseUserGuard)
@Controller('sum-sub')
@ApiBearerAuth()
export class SumSubController {
  constructor(public sumSubService: SumSubService) {}

  @Get('/token')
  @ApiResponse({ type: SumSubTokenResponseDTO, status: 200 })
  async getToken(@UserContext() user: UsersEntity): Promise<SumSubTokenResponseDTO> {
    return await this.sumSubService.requestToken(user.auth0Id)
  }

  @Post('/add')
  @ApiResponse({ type: SumSubApplicantResponseDTO, status: 200 })
  async addApplicant(
    @UserContext() user: UsersEntity,
    @Body() applicantDetails: SumSubApplicantDetailDTO
  ): Promise<SumSubApplicantResponseDTO> {
    return await this.sumSubService.addApplicant(user.auth0Id, applicantDetails)
  }
}
