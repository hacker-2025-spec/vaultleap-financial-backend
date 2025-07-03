import { Global, Module } from '@nestjs/common'

import { AwsModule } from '../aws/aws.module'

import { EmailSenderService } from './email-sender.service'

@Global()
@Module({
  providers: [EmailSenderService],
  imports: [AwsModule],
  exports: [EmailSenderService],
})
export class EmailSenderModule {}
