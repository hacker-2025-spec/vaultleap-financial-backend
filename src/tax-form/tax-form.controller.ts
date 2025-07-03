import { plainToInstance } from 'class-transformer'

import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common'

import { UsersEntity } from '../users/users.entity'
import { BaseUserGuard } from '../auth/baseUser.guard'
import { UserContext } from '../users/users.decorator'

import { IpAddress } from './ip-address.decorator'
import { TaxFormService } from './tax-form.service'
import { AccessTaxFormDto, TaxFormVaultInfoDto, AccessTaxFormResponseDto, RequestTaxFormAccessResponseDto } from './tax-form.dto'

@Controller('tax-form')
@ApiTags('Tax Forms')
@ApiBearerAuth()
@UseGuards(BaseUserGuard)
export class TaxFormController {
  constructor(private readonly taxFormService: TaxFormService) {}

  @Get('/tax-forms')
  @ApiResponse({ type: TaxFormVaultInfoDto, status: 200, isArray: true })
  async getAllForms(@UserContext() user: UsersEntity): Promise<TaxFormVaultInfoDto[]> {
    const userForms = await this.taxFormService.getAllUserForms(user.auth0Id)
    return plainToInstance(TaxFormVaultInfoDto, userForms, { excludeExtraneousValues: true })
  }

  @Post('/request/:id')
  @ApiResponse({ type: RequestTaxFormAccessResponseDto, status: 200 })
  async requestTaxFormAccess(
    @UserContext() user: UsersEntity,
    @IpAddress() ipAddress: string,
    @Param('id') id: string
  ): Promise<RequestTaxFormAccessResponseDto> {
    return await this.taxFormService.requestTaxFormAccess(user, ipAddress, id)
  }

  @Post('/access/:id')
  @ApiResponse({ type: AccessTaxFormResponseDto, status: 200 })
  async accessTaxForm(
    @UserContext() user: UsersEntity,
    @Param('id') id: string,
    @Body() accessForm: AccessTaxFormDto
  ): Promise<AccessTaxFormResponseDto> {
    return await this.taxFormService.accessTaxFormById(user.auth0Id, id, accessForm.securityCode)
  }

  @Post('/downloaded/:id')
  async taxFormDownloaded(@UserContext() user: UsersEntity, @IpAddress() ipAddress: string, @Param('id') id: string): Promise<string> {
    await this.taxFormService.taxFormDownloaded(user, ipAddress, id)
    return 'success'
  }
}
