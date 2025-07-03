import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import config from '../config/config'
import { AwsModule } from '../aws/aws.module'
import { GlobalModule } from '../global.module'

import { TaxFormModule } from './tax-form.module'

@Module({
  imports: [ConfigModule.forRoot({ load: [config], isGlobal: true, ignoreEnvFile: true }), TaxFormModule, AwsModule, GlobalModule],
})
export class TaxFormHandlerModule {}
