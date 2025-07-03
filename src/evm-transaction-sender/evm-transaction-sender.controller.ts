import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common'

import { UsersEntity } from '../users/users.entity'
import { BaseUserGuard } from '../auth/baseUser.guard'
import { UserContext } from '../users/users.decorator'

import { SendEvmTransactionDto } from './evm-transaction-sender.dto'
import { EvmTransactionSenderService } from './evm-transaction-sender.service'
import type { TransactionRequestDetail } from './evm-transaction-sender.types'

@Controller('evm-transaction-sender')
@ApiTags('EVM Transaction sender')
@UseGuards(BaseUserGuard)
@ApiBearerAuth()
export class EvmTransactionSenderController {
  constructor(private service: EvmTransactionSenderService) {}

  @Post('')
  @ApiResponse({ type: SendEvmTransactionDto, status: 201 })
  @HttpCode(201)
  async createTransaction(@Body() body: SendEvmTransactionDto, @UserContext() user: UsersEntity) {
    const evmTransactionRequestData = {
      value: '0' as string,
      transactionType: body.transactionType,
      to: body.to,
      origin: 'getrewards.api',
      data: body.data,
      auth0Id: user.auth0Id,
    } satisfies TransactionRequestDetail

    await this.service.sendTransactionEvent(evmTransactionRequestData)

    return {}
  }
}
