import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common'

import { UsersEntity } from '../users/users.entity'
import { UserContext } from '../users/users.decorator'
import { BaseUserGuard } from '../auth/baseUser.guard'
import { TRANSACTION_STATUS } from '../evm-transaction-sender/evm-transaction-sender.types'

import { VaultUserRole } from './vault.types'
import { VaultService } from './vault.service'
import {
  VaultDto,
  VaultInfoDto,
  VaultKeysDto,
  VaultTransactionStatusDTO,
  UpdateRoleEmailDto,
  VaultCreationDto,
  SelfManagedVaultTransactionStatusDTO,
  SignVaultTransactionDto,
  SignVaultTransactionResultDto,
} from './vault.dto'

@Controller('vault')
@ApiTags('Vault')
@UseGuards(BaseUserGuard)
@ApiBearerAuth()
export class VaultController {
  constructor(private readonly vaultService: VaultService) {}

  @Get('/vaults')
  @ApiQuery({ name: 'role', required: false, type: String })
  @ApiResponse({ type: VaultDto, status: 200, isArray: true })
  async getAllUserVaults(@UserContext() user: UsersEntity, @Query('role') role?: VaultUserRole): Promise<VaultDto[]> {
    return await this.vaultService.getAllUserVaults(user, role)
  }

  @Get(':id')
  @ApiResponse({ type: VaultDto, status: 200 })
  async getVaultById(@Param('id') id: string): Promise<VaultDto> {
    return await this.vaultService.getVaultById(id)
  }

  @Get(':id/info')
  @ApiQuery({ name: 'role', required: true, type: String })
  @ApiResponse({ type: VaultInfoDto, status: 200 })
  async getVaultInfoById(
    @UserContext() user: UsersEntity,
    @Param('id') id: string,
    @Query('role') role: VaultUserRole
  ): Promise<VaultInfoDto> {
    return await this.vaultService.getVaultInfoById(user, id, role)
  }

  @Get(':id/info-by-token-id')
  @ApiQuery({ name: 'tokenId', required: true, type: String })
  @ApiResponse({ type: VaultInfoDto, status: 200 })
  async getVaultInfoByIdAndTokenId(
    @UserContext() user: UsersEntity,
    @Param('id') id: string,
    @Query('tokenId') tokenId: string
  ): Promise<VaultInfoDto> {
    return await this.vaultService.getVaultInfoById(user, id, VaultUserRole.CONTRACTOR, tokenId)
  }

  @Get(':id/status')
  @ApiResponse({ type: VaultTransactionStatusDTO, status: 200, example: TRANSACTION_STATUS.SUCCESSFUL })
  async getVaultTransactionStatus(@Param('id') id: string): Promise<VaultTransactionStatusDTO> {
    return await this.vaultService.getTransactionStatus(id)
  }

  @Get(':id/self-managed-status')
  @ApiResponse({ type: SelfManagedVaultTransactionStatusDTO, status: 200 })
  async getSelfManagedVaultTransactionStatus(@Param('id') id: string): Promise<SelfManagedVaultTransactionStatusDTO> {
    return await this.vaultService.getSelfManagedVaultTransactionStatus(id)
  }

  @Post()
  @ApiResponse({ type: VaultDto, status: 200 })
  async createVault(@Body() vaultConfig: VaultCreationDto): Promise<VaultDto> {
    return await this.vaultService.createVault(vaultConfig)
  }

  @Post(':id/update-role-email')
  @ApiResponse({ type: VaultDto, status: 200 })
  async updateRoleEmail(
    @UserContext() user: UsersEntity,
    @Param('id') id: string,
    @Body() roleConfig: UpdateRoleEmailDto
  ): Promise<VaultDto> {
    return await this.vaultService.updateRoleEmail(id, roleConfig.tokenAddress, user.email)
  }

  @Post(':id/finish-self-managed-vault-claim')
  @ApiResponse({ type: VaultDto, status: 200 })
  async finishSelfManagedVaultClaim(@Param('id') id: string, @Body() roleConfig: UpdateRoleEmailDto): Promise<VaultDto> {
    return await this.vaultService.finishSelfManagedVaultClaim(id, roleConfig.tokenAddress)
  }

  @Post(':id/unwatch')
  @ApiQuery({ name: 'role', required: true, type: String })
  @ApiResponse({ type: VaultDto, status: 200 })
  async unwatchVault(@UserContext() user: UsersEntity, @Param('id') id: string, @Query('role') role: VaultUserRole): Promise<VaultDto> {
    return await this.vaultService.unwatchVault(user, id, role)
  }

  @Post('/watch-all')
  @ApiResponse({ type: VaultDto, status: 200, isArray: true })
  async watchAllVaults(@UserContext() user: UsersEntity): Promise<VaultDto[]> {
    return await this.vaultService.watchAllVaults(user)
  }

  @Get('/keys/:walletAddress')
  @ApiResponse({ type: VaultKeysDto, status: 200, isArray: true })
  async getVaultKeys(@Param('walletAddress') walletAddress: string): Promise<VaultKeysDto[]> {
    return await this.vaultService.getVaultKeysByWalletAddress(walletAddress)
  }

  @Post('/create-self-managed')
  @ApiResponse({ type: VaultDto, status: 200 })
  async createSelfManagedVault(@Body() vaultConfig: VaultCreationDto): Promise<VaultDto> {
    return await this.vaultService.createSelfManagedVault(vaultConfig)
  }

  @Post('/sign-vault-transaction')
  @ApiResponse({ type: SignVaultTransactionResultDto, status: 200 })
  async signVaultTransaction(
    @UserContext() user: UsersEntity,
    @Body() { vaultId, p, address }: SignVaultTransactionDto
  ): Promise<SignVaultTransactionResultDto> {
    const signature = await this.vaultService.signVaultTransaction({ user, vaultId, encryptedPrivateKey: p, address })
    if (signature) {
      return { signature }
    }
    return {}
  }
}
