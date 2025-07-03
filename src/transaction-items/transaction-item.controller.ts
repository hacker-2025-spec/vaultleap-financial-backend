import { Controller, Get, Param, Query, UseGuards, Post, Body } from '@nestjs/common'
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger'
import { BaseUserGuard } from '../auth/baseUser.guard'
import { TransactionItemService } from './services/transaction-item.service'
import { GetTransactionItemsQueryDto, GetTransactionItemsResponseDto, TransactionItemResponseDto } from './dto/transaction-item.dto'
import { TransactionItemEntity, TransactionSource } from './transaction-item.entity'
import { UserContext } from '../users/users.decorator'
import { UsersEntity } from '../users/users.entity'

@UseGuards(BaseUserGuard)
@ApiBearerAuth()
@ApiTags('Transaction Items')
@Controller('transaction-items')
export class TransactionItemController {
  constructor(private readonly transactionItemService: TransactionItemService) {}

  @Get()
  @ApiResponse({ type: GetTransactionItemsResponseDto, status: 200 })
  async getTransactionItems(
    @Query() query: GetTransactionItemsQueryDto,
    @UserContext() user: UsersEntity
  ): Promise<GetTransactionItemsResponseDto> {
    const { auth0Id } = user

    return await this.transactionItemService.getTransactionItems(auth0Id, query)
  }

  @Get(':id')
  @ApiResponse({ type: TransactionItemResponseDto, status: 200 })
  async getTransactionItemById(@Param('id') id: string, @UserContext() user: UsersEntity): Promise<TransactionItemResponseDto | null> {
    const item = await this.transactionItemService.findOneById(user.auth0Id, id)

    return item
  }

  @Get('virtual-account/:virtualAccountId')
  @ApiResponse({ type: [TransactionItemResponseDto], status: 200 })
  async getTransactionItemsByVirtualAccountId(
    @Param('virtualAccountId') virtualAccountId: string,
    @UserContext() user: UsersEntity
  ): Promise<{ items: TransactionItemEntity[]; nextCursor?: Record<string, any> }> {
    return this.transactionItemService.getTransactionItemsByVirtualAccountId(user.auth0Id, virtualAccountId)
  }

  @Post('test')
  @ApiResponse({ status: 201 })
  async testUpsert(@Body() testData: Record<string, unknown>): Promise<{ success: boolean; message: string }> {
    try {
      const testItem = new TransactionItemEntity()
      testItem.id = (testData.id as string) || `test-${Date.now()}`
      testItem.source = TransactionSource.MANUAL
      testItem.customerId = (testData.customerId as string) || 'test-customer'
      testItem.virtualAccountId = (testData.virtualAccountId as string) || 'test-virtual-account'
      testItem.type = 'funds_received'
      testItem.amount = (testData.amount as number) || 100
      testItem.currency = 'USD'
      testItem.occurredAt = Date.now()
      testItem.description = 'Test transaction item'

      await this.transactionItemService.create(testItem)

      return { success: true, message: `Test item created with ID: ${testItem.id}` }
    } catch (error) {
      return { success: false, message: `Error: ${error.message}` }
    }
  }
}
