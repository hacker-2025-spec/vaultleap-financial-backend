import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { ForexService } from './forex.service'
import { ForexController } from './forex.controller'
import { RedisModule } from '../redis/redis.module'

@Module({
  imports: [
    HttpModule.register({
      timeout: 10_000,
      maxRedirects: 5,
    }),
    RedisModule,
  ],
  controllers: [ForexController],
  providers: [ForexService],
  exports: [ForexService],
})
export class ForexModule {}
