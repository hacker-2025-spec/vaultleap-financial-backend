import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common'

import { UsersEntity } from '../users/users.entity'
import { BaseUserGuard } from '../auth/baseUser.guard'
import { UserContext } from '../users/users.decorator'

import { VaultsCreatorService } from './vaults-creator.service'
import { VaultsCreatorConfigDto, VaultsCreationStatusDto, VaultsCreatorDto } from './vaults-creator.dto'

@Controller('vaults-creator')
@ApiTags('Vaults Creator')
@UseGuards(BaseUserGuard)
@ApiBearerAuth()
export class VaultsCreatorController {
  constructor(private readonly vaultsCreatorService: VaultsCreatorService) {}

  @Post('/create')
  @ApiResponse({ type: VaultsCreatorDto, status: 200 })
  async createVaults(@UserContext() user: UsersEntity, @Body() vaultsConfig: VaultsCreatorConfigDto): Promise<VaultsCreatorDto> {
    return await this.vaultsCreatorService.createVaults(user.auth0Id, vaultsConfig)
  }

  @Get(':id/status')
  @ApiResponse({ type: VaultsCreationStatusDto, status: 200 })
  async getVaultsCreationStatus(@Param('id') id: string): Promise<VaultsCreationStatusDto> {
    return await this.vaultsCreatorService.getVaultsStatus(id)
  }

  @Get(':id/info')
  @ApiResponse({ type: VaultsCreatorDto, status: 200 })
  async getVaultsInfo(@Param('id') id: string): Promise<VaultsCreatorDto> {
    return await this.vaultsCreatorService.getVaultsById(id)
  }
}
