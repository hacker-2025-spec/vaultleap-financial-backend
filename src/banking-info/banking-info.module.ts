import { Module } from '@nestjs/common'

import { BankingInfoService } from './banking-info.service'
import { BankingInfoContoller } from './banking-info.controller'
import { AwsModule } from '../aws/aws.module'

@Module({
  providers: [BankingInfoService],
  imports: [AwsModule],
  exports: [BankingInfoService],
  controllers: [BankingInfoContoller],
})
export class BankingInfoModule {}
