import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Controller, Get, HttpCode, Param, UseGuards } from '@nestjs/common'
import { BaseUserGuard } from '../auth/baseUser.guard'
import { BankingInfoService } from './banking-info.service'
import { BankingInfoEntity } from './banking-info.entity'
import { UserContext } from '../users/users.decorator'
import { UsersEntity } from '../users/users.entity'

@ApiTags('Banking info')
@UseGuards(BaseUserGuard)
@Controller('banking-info')
@ApiBearerAuth()
export class BankingInfoContoller {
  constructor(private bankingInfoService: BankingInfoService) {}

  @Get('')
  @ApiResponse({ type: [BankingInfoEntity], status: 200 })
  @HttpCode(200)
  async getBankingInfo(@UserContext() user: UsersEntity): Promise<BankingInfoEntity[]> {
    return await this.bankingInfoService.getBankingInfoByAuth0Id(user.auth0Id)
  }

  @Get('/:id')
  @ApiResponse({ type: BankingInfoEntity, status: 200 })
  @HttpCode(200)
  async getBankingInfoById(@UserContext() user: UsersEntity, @Param('id') id: string): Promise<BankingInfoEntity> {
    return await this.bankingInfoService.getBankingInfoById(user.auth0Id, id)
  }
}
