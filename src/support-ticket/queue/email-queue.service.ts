import { Injectable } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'

import { SUPPORT_TICKET_QUEUE } from './email-queue.constants'
import type { CreateSupportTicketDto } from '../dto/create-support-ticket.dto'

@Injectable()
export class EmailQueueService {
  constructor(
    @InjectQueue(SUPPORT_TICKET_QUEUE)
    private readonly queue: Queue
  ) {}

  /**
   * Drop an inbound support-ticket e-mail job on the queue.
   * Retries = 3, exponential back-off, old failures capped at 100.
   */
  async enqueueSupportTicket(dto: CreateSupportTicketDto): Promise<void> {
    await this.queue.add(SUPPORT_TICKET_QUEUE, dto, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 30_000 },
      removeOnComplete: 1000,
      removeOnFail: 100,
    })
  }
}
