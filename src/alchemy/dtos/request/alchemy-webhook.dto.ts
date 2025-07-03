import { ApiProperty } from '@nestjs/swagger'
import { IsDateString, IsObject, IsString } from 'class-validator'
import { AlchemyActivityWebhookEvent } from '../../alchemy.types'

export class AlchemyWebhookDto {
  @ApiProperty({
    example: 'wh_octjglnywaupz6th',
    description: 'Unique ID of the webhook destination.',
  })
  @IsString()
  webhookId: string

  @ApiProperty({
    example: 'whevt_ogrc5v64myey69ux',
    description: 'ID of the event.',
  })
  @IsString()
  id: string

  @ApiProperty({
    example: '2022-02-28T17:48:53.306Z',
    description: 'Timestamp when the webhook was created.',
  })
  @IsDateString()
  createdAt: string

  @ApiProperty({
    example: 'ADDRESS_ACTIVITY',
    description: 'Webhook event type.',
  })
  @IsString()
  type: string

  @ApiProperty({
    description: 'Mined transaction object.',
  })
  @IsObject()
  event: AlchemyActivityWebhookEvent
}
