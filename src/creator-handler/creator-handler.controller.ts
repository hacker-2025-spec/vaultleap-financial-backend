import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Body, Controller, Post, Param, UseGuards } from '@nestjs/common'

import { VaultDto } from '../vault/vault.dto'
import { UsersEntity } from '../users/users.entity'
import { UserContext } from '../users/users.decorator'
import { BaseUserGuard } from '../auth/baseUser.guard'

import { AdminDetailsDto } from './creator-handler.dto'
import { CreatorHandlerService } from './creator-handler.service'

@ApiTags('Creator Handler')
@UseGuards(BaseUserGuard)
@ApiBearerAuth()
@Controller('creator-handler')
export class CreatorHandlerController {
  constructor(public creatorHandlerService: CreatorHandlerService) {}

  @Post('/process-vault-creation/:vaultId')
  @ApiResponse({ type: VaultDto, status: 200 })
  async processCreatorConfig(
    @Param('vaultId') vaultId: string,
    @UserContext() user: UsersEntity,
    @Body() adminDetails: AdminDetailsDto
  ): Promise<VaultDto> {
    return await this.creatorHandlerService.processCreatorConfigSubmission(vaultId, user.auth0Id, adminDetails.walletAddress)
  }
}
