import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'

import { SumSubService } from './sum-sub.service'
import { SumSubController } from './sum-sub.controller'

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
  ],
  providers: [SumSubService],
  exports: [SumSubService],
  controllers: [SumSubController],
})
export class SumSubModule {}
