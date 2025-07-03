import { Module } from '@nestjs/common'
import { SupportTicketController } from './support-ticket.controller'
import { EmailQueueService } from './queue/email-queue.service'
import { BullModule } from '@nestjs/bullmq'
import { SUPPORT_TICKET_QUEUE } from './queue/email-queue.constants'
import { EmailQueueProcessor } from './queue/email-queue.processor'

@Module({
  imports: [
    BullModule.registerQueue({
      name: SUPPORT_TICKET_QUEUE,
    }),
  ],
  providers: [EmailQueueService, EmailQueueProcessor],
  controllers: [SupportTicketController],
})
export class SupportTicketModule {}
