import { Response } from 'express'
import { ApiTags } from '@nestjs/swagger'
import { Controller, Post, Body, Req, Res } from '@nestjs/common'

import { RawBodyRequest } from '../utils/helpers'
import { BridgeEventWebhookDTO } from './bridge-xyz.dto'
import { BridgeXyzService } from './bridge-xyz.service'

@ApiTags('Bridge XYZ')
@Controller('bridge-xyz')
export class LiquidationAddressesController {
  constructor(private bridgeXyzService: BridgeXyzService) {}

  @Post('/webhook')
  eventsWebhook(@Req() request: RawBodyRequest, @Res() response: Response, @Body() bridgeEventWebhookDTO: BridgeEventWebhookDTO) {
    response.send(200)

    const isRequestValid = this.bridgeXyzService.verifyBridgeEventSignature(request)
    if (isRequestValid) return
    void this.bridgeXyzService.processBridgeEvent(bridgeEventWebhookDTO)
  }
}
