import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { EmailQueueService } from './queue/email-queue.service'
import { BaseUserGuard } from '../auth/baseUser.guard'

@UseGuards(BaseUserGuard)
@ApiBearerAuth()
@ApiTags('Support Tickets')
@Controller('support-tickets')
export class SupportTicketController {
  constructor(private readonly emailQueue: EmailQueueService) {}

  @Post()
  async fileTicket(@Body() dto: CreateSupportTicketDto) {
    await this.emailQueue.enqueueSupportTicket(dto)
    return { status: 'queued' }
  }
}
