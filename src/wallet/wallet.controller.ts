import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { Get, Body, Post, UseGuards, Controller } from '@nestjs/common'

import { UsersEntity } from '../users/users.entity'
import { UserContext } from '../users/users.decorator'
import { BaseUserGuard } from '../auth/baseUser.guard'

import { WalletService } from './wallet.service'
import { WalletCreationDto, WalletDto, WalletStatusDto } from './wallet.dto'

@Controller('wallet')
@ApiTags('Wallet')
@UseGuards(BaseUserGuard)
@ApiBearerAuth()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('current-user-wallets')
  @ApiResponse({ type: WalletDto, status: 200, isArray: true })
  async getCurrentUserWallets(@UserContext() user: UsersEntity) {
    return await this.walletService.getWalletsByAuth0Id(user.auth0Id)
  }

  @Post('check-wallet')
  @ApiResponse({ type: WalletStatusDto, status: 200 })
  async checkWallet(@UserContext() user: UsersEntity, @Body() walletConfig: WalletCreationDto) {
    return await this.walletService.checkWallet(user.auth0Id, walletConfig)
  }

  @Post('create-wallet')
  @ApiResponse({ type: WalletDto, status: 200 })
  async createWallet(@UserContext() user: UsersEntity, @Body() walletConfig: WalletCreationDto) {
    return await this.walletService.createWallet(user.auth0Id, walletConfig)
  }
}
