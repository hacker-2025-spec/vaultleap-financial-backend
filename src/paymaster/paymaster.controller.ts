import { ApiResponse } from '@nestjs/swagger'
import { Body, Controller, HttpCode, Post } from '@nestjs/common'

import { PaymasterService } from './paymaster.service'
import { PaymasterServiceRequestDto, PaymasterServiceResponseDto } from './paymaster.dto'

@Controller('paymaster')
export class PaymasterController {
  constructor(private service: PaymasterService) {}

  @Post('')
  @ApiResponse({ type: PaymasterServiceResponseDto, status: 200 })
  @HttpCode(200)
  paymaster(@Body() body: PaymasterServiceRequestDto) {
    if (body.method === 'pm_getPaymasterStubData') {
      return {
        result: this.service.getPaymasterStubData(),
        jsonrpc: body.jsonrpc,
        id: body.id,
      }
    }
    if (body.method === 'pm_getPaymasterData') {
      return {
        result: this.service.getPaymasterData(),
        jsonrpc: body.jsonrpc,
        id: body.id,
      }
    }
  }
}
