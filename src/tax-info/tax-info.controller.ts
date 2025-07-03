import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'

import { UsersEntity } from '../users/users.entity'
import { BaseUserGuard } from '../auth/baseUser.guard'
import { UserContext } from '../users/users.decorator'

import { TaxInfoService } from './tax-info.service'
import { VaultWithTaxInfoDto, TaxInfoCreationDto, TaxInfoDto } from './tax-info.dto'

@ApiTags('Tax Info')
@UseGuards(BaseUserGuard)
@Controller('tax-info')
@ApiBearerAuth()
export class TaxInfoController {
  constructor(public taxInfoService: TaxInfoService) {}

  @Post('/create')
  @ApiResponse({ type: TaxInfoDto, status: 200 })
  async createTaxInfo(@UserContext() user: UsersEntity, @Body() informationConfig: TaxInfoCreationDto): Promise<TaxInfoDto> {
    return await this.taxInfoService.createTaxInfo(user.auth0Id, informationConfig)
  }

  @Get('/latest')
  @ApiResponse({ type: VaultWithTaxInfoDto, status: 200 })
  async getLatestVaultOwnerTaxInfo(@UserContext() user: UsersEntity): Promise<VaultWithTaxInfoDto | undefined> {
    return await this.taxInfoService.getLatestVaultOwnerTaxInfo(user.auth0Id)
  }
}
