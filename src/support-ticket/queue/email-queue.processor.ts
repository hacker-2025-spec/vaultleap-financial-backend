import { Processor, WorkerHost } from '@nestjs/bullmq'
import type { Job } from 'bullmq'
import { SUPPORT_TICKET_QUEUE } from './email-queue.constants'
import { EmailSenderService } from '../../email-sender/email-sender.service'

@Processor(SUPPORT_TICKET_QUEUE)
export class EmailQueueProcessor extends WorkerHost {
  constructor(private readonly emailSender: EmailSenderService) {
    super()
  }

  override async process(job: Job): Promise<void> {
    const { name, email, subject, message } = job.data as {
      name: string
      email: string
      subject: string
      message: string
    }

    await this.emailSender.sendSupportTicketEmail(name, email, subject, message)
  }
}
