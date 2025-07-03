import { Module } from '@nestjs/common'

import { BridgeKYCService } from './bridge-kyc.service'
import { AwsModule } from '../aws/aws.module'

@Module({
  providers: [BridgeKYCService],
  imports: [AwsModule],
  exports: [BridgeKYCService],
})
export class BridgeKYCModule {}
