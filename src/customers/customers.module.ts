import { Module } from '@nestjs/common'

import { CustomersService } from './customers.service'
import { AwsModule } from '../aws/aws.module'

@Module({
  providers: [CustomersService],
  imports: [AwsModule],
  exports: [CustomersService],
})
export class CustomersModule {}
