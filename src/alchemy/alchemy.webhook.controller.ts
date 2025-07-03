import { Controller, Headers, Post, Req } from '@nestjs/common'
import { Request } from 'express'
import { AlchemyWebhookHandlerService } from './services/alchemy-webhook-handler.service'

@Controller('webhook/alchemy')
export class AlchemyWebhookController {
  constructor(private readonly alchemyWebhookService: AlchemyWebhookHandlerService) {}

  @Post()
  async handleAlchemyWebhook(@Req() request: Request, @Headers('x-alchemy-signature') signature: string) {
    const { rawBody } = request as any
    await this.alchemyWebhookService.processWebhook(rawBody, signature)
    return { success: true }
  }
}
