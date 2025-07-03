import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Controller, Get, HttpCode, Param, UseGuards } from '@nestjs/common'
import { BaseUserGuard } from '../auth/baseUser.guard'
import { LiquidationAddressesService } from './liquidation-addresses.service'
import { LiquidationAddressEntity } from './liquidation-addresses.entity'
import { UserContext } from '../users/users.decorator'
import { UsersEntity } from '../users/users.entity'

@ApiTags('Liquidation addresses')
@UseGuards(BaseUserGuard)
@Controller('liquidation-addresses')
@ApiBearerAuth()
export class LiquidationAddressesController {
  constructor(private liquidationAddressesService: LiquidationAddressesService) {}

  @Get('')
  @ApiResponse({ type: [LiquidationAddressEntity], status: 200 })
  @HttpCode(200)
  async getLiquidationAddressByAuth0Id(@UserContext() user: UsersEntity): Promise<LiquidationAddressEntity[]> {
    return await this.liquidationAddressesService.getLiquidationAddressByAuth0Id(user.auth0Id)
  }

  @Get('/:id')
  @ApiResponse({ type: LiquidationAddressEntity, status: 200 })
  @HttpCode(200)
  async getLiquidationAddressById(@UserContext() user: UsersEntity, @Param('id') id: string): Promise<LiquidationAddressEntity> {
    return await this.liquidationAddressesService.getLiquidationAddressById(user.auth0Id, id)
  }
}
