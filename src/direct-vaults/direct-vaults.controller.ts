import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common'
import {
  CheckKycStatusDto,
  CreateBankingInfoDto,
  CreateCustomerDTO,
  CreateLiquidationAddressShortDTO,
  GetLiqAddressDrainHistoryDTO,
} from './direct-vaults.dto'
import { BridgeKYCEntity } from '../bridge-kyc/bridge-kyc.entity'
import { DirectVaultsService } from './direct-vaults.service'
import { BaseUserGuard } from '../auth/baseUser.guard'
import { UserContext } from '../users/users.decorator'
import { UsersEntity } from '../users/users.entity'
import { CreateCustomerFromKycResponseDTO, GetLiqAddressDrainHistoryResponseDTO } from '../bridge-xyz/bridge-xyz.dto'
import { LiquidationAddressEntity } from '../liquidation-addresses/liquidation-addresses.entity'
import { BankingInfoEntity } from '../banking-info/banking-info.entity'

@ApiTags('Direct-vaults')
@UseGuards(BaseUserGuard)
@Controller('direct-vaults')
@ApiBearerAuth()
export class DirectVaultsController {
  constructor(private directVaultsService: DirectVaultsService) {}

  @Post('/create-customer')
  @ApiResponse({ type: BridgeKYCEntity, status: 200 })
  @HttpCode(200)
  async createCustom(@UserContext() user: UsersEntity, @Body() body: CreateCustomerDTO): Promise<BridgeKYCEntity> {
    return await this.directVaultsService.createCustomer(user.auth0Id, body)
  }

  @Post('/create-bankin-info')
  @ApiResponse({ type: BankingInfoEntity, status: 200 })
  @HttpCode(200)
  async createBankingInfo(@UserContext() user: UsersEntity, @Body() body: CreateBankingInfoDto): Promise<BankingInfoEntity> {
    return await this.directVaultsService.createBankingAccount(user.auth0Id, body)
  }

  @Post('/check-kyc-status')
  @ApiResponse({ type: CreateCustomerFromKycResponseDTO, status: 200 })
  @HttpCode(200)
  async checkKYC(@UserContext() user: UsersEntity, @Body() { bridgeKYCId }: CheckKycStatusDto): Promise<CreateCustomerFromKycResponseDTO> {
    return await this.directVaultsService.checkKYC(user.auth0Id, bridgeKYCId)
  }

  @Post('/create-liquidation-address')
  @ApiResponse({ type: LiquidationAddressEntity, status: 200 })
  @HttpCode(200)
  async createLiquidationAddress(
    @UserContext() user: UsersEntity,
    @Body() data: CreateLiquidationAddressShortDTO
  ): Promise<LiquidationAddressEntity> {
    return await this.directVaultsService.createLiquidationAddress(user.auth0Id, data)
  }

  @Post('/get-liquidation-address-drain-history')
  @ApiResponse({ type: GetLiqAddressDrainHistoryResponseDTO, status: 200 })
  @HttpCode(200)
  async getLiqAddressDrainHistory(
    @UserContext() user: UsersEntity,
    @Body() data: GetLiqAddressDrainHistoryDTO
  ): Promise<GetLiqAddressDrainHistoryResponseDTO> {
    return await this.directVaultsService.getLiqAddressDrainHistory(user.auth0Id, data.liqAddressId)
  }
}
