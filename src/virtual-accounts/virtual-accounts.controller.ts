import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Controller, Get, HttpCode, Param, Post, Body, UseGuards, Query } from '@nestjs/common'
import { BaseUserGuard } from '../auth/baseUser.guard'
import { UserContext } from '../users/users.decorator'
import { UsersEntity } from '../users/users.entity'
import { VirtualAccountsService } from './virtual-accounts.service'
import { DirectRecipientService } from './direct-recipient.service'
import { VirtualAccountEntity } from './virtual-accounts.entity'
import { DirectRecipientEntity } from './direct-recipient.entity'
import { CreateVirtualAccountDto, VirtualAccountActivityQueryDto, CreateUnifiedAccountDto, GetUnifiedAccountsQueryDto } from './virtual-accounts.dto'
import { type VirtualAccountActivity, VirtualAccountActivityItem } from '../bridge-xyz/bridge-xyz.dto'
import { LiquidationAddressEntity } from '../liquidation-addresses/liquidation-addresses.entity'

@ApiTags('Virtual accounts')
@UseGuards(BaseUserGuard)
@Controller('virtual-accounts')
@ApiBearerAuth()
export class VirtualAccountsController {
  constructor(
    private virtualAccountsService: VirtualAccountsService,
    private directRecipientService: DirectRecipientService
  ) {}

  @Get('')
  @ApiResponse({ type: [VirtualAccountEntity], status: 200 })
  @HttpCode(200)
  async getVirtualAccountsByAuth0Id(@UserContext() user: UsersEntity): Promise<VirtualAccountEntity[]> {
    return await this.virtualAccountsService.getVirtualAccountByAuth0Id(user.auth0Id)
  }

  @Get('/unified')
  @ApiResponse({
    description: 'Get all unified accounts (both Bridge and direct Web3) with optional filtering',
    status: 200,
    schema: {
      type: 'object',
      properties: {
        bridgeAccounts: {
          type: 'array',
          items: { $ref: '#/components/schemas/LiquidationAddressEntity' }
        },
        directRecipients: {
          type: 'array',
          items: { $ref: '#/components/schemas/DirectRecipientEntity' }
        },
        total: { type: 'number' }
      }
    }
  })
  @HttpCode(200)
  async getUnifiedAccounts(
    @UserContext() user: UsersEntity,
    @Query() query: GetUnifiedAccountsQueryDto
  ): Promise<{
    bridgeAccounts: LiquidationAddressEntity[],
    directRecipients: DirectRecipientEntity[],
    total: number
  }> {
    return await this.virtualAccountsService.getUnifiedAccounts(user.auth0Id, query)
  }

  @Post('/unified')
  @ApiResponse({
    description: 'Create unified account - either Bridge liquidation address or direct Web3 recipient',
    status: 201,
    schema: {
      oneOf: [
        { $ref: '#/components/schemas/LiquidationAddressEntity' },
        { $ref: '#/components/schemas/DirectRecipientEntity' }
      ]
    }
  })
  @HttpCode(201)
  async createUnifiedAccount(@UserContext() user: UsersEntity, @Body() data: CreateUnifiedAccountDto): Promise<LiquidationAddressEntity | DirectRecipientEntity> {
    return await this.virtualAccountsService.createUnifiedAccount(user.auth0Id, data)
  }


  @Post('')
  @ApiResponse({ type: VirtualAccountEntity, status: 200 })
  @HttpCode(200)
  async createVirtualAccount(@UserContext() user: UsersEntity, @Body() data: CreateVirtualAccountDto): Promise<VirtualAccountEntity> {
    return await this.virtualAccountsService.createVirtualAccount(user.auth0Id, data)
  }

  @Get('/:id')
  @ApiResponse({ type: VirtualAccountEntity, status: 200 })
  @HttpCode(200)
  async getVirtualAccountById(@UserContext() user: UsersEntity, @Param('id') id: string): Promise<VirtualAccountEntity> {
    return await this.virtualAccountsService.getVirtualAccountById(user.auth0Id, id)
  }

  @Post('/:id')
  @ApiResponse({
    type: VirtualAccountEntity,
    status: 200,
    description: 'Fetch virtual account from Bridge and save updated version to the local DB',
  })
  @HttpCode(200)
  async updateVirtualAccount(@UserContext() user: UsersEntity, @Param('id') id: string): Promise<VirtualAccountEntity | void> {
    return await this.virtualAccountsService.updateVirtualAccountById(user.auth0Id, id)
  }

  @Get('/:virtualAccountId/activity/all')
  @ApiResponse({
    type: [VirtualAccountActivityItem],
    status: 200,
    description: 'Fetch all virtual account activity from Bridge (non-paginated)',
  })
  @HttpCode(200)
  async getVirtualAccountActvity(
    @UserContext() user: UsersEntity,
    @Param('virtualAccountId') virtualAccountId: string,
    @Query('customerId') customerId: string,
    @Query('eventType') eventType?: string
  ): Promise<VirtualAccountActivity> {
    return await this.virtualAccountsService.getVirtualAccountActivity({
      auth0Id: user.auth0Id,
      virtualAccountId,
      customerId,
      eventType,
    })
  }

  @Get('/:virtualAccountId/activity')
  @ApiResponse({
    type: [VirtualAccountActivityItem],
    status: 200,
    description: 'Fetch virtual account activity from Bridge with pagination',
  })
  @HttpCode(200)
  async getVirtualAccountActivityPaginated(
    @UserContext() user: UsersEntity,
    @Param('virtualAccountId') virtualAccountId: string,
    @Query('customerId') customerId: string,
    @Query() paginationQuery: VirtualAccountActivityQueryDto
  ): Promise<VirtualAccountActivity> {
    const { limit, startingAfterId, endingBeforeId, eventType } = paginationQuery

    return await this.virtualAccountsService.getVirtualAccountActivityPaginated({
      auth0Id: user.auth0Id,
      virtualAccountId,
      customerId,
      ...(limit && { limit: Number.parseInt(limit, 10) }),
      startingAfterId,
      endingBeforeId,
      eventType,
    })
  }

  @Get('/direct-recipients')
  @ApiResponse({
    type: [DirectRecipientEntity],
    status: 200,
    description: 'Get all direct Web3 recipients for the authenticated user'
  })
  @HttpCode(200)
  async getDirectRecipients(@UserContext() user: UsersEntity): Promise<DirectRecipientEntity[]> {
    return await this.directRecipientService.getDirectRecipientsByAuth0Id(user.auth0Id)
  }

  @Get('/direct-recipients/:id')
  @ApiResponse({
    type: DirectRecipientEntity,
    status: 200,
    description: 'Get a specific direct Web3 recipient by ID'
  })
  @HttpCode(200)
  async getDirectRecipientById(@UserContext() user: UsersEntity, @Param('id') id: string): Promise<DirectRecipientEntity> {
    return await this.directRecipientService.getDirectRecipientById(user.auth0Id, id)
  }
}
