import { Module } from '@nestjs/common'
import { RedisService } from './redis.service'
import { ConfigModule } from '@nestjs/config'
import { SecretsManagerModule } from '../secrets-manager/secrets-manager.module'

@Module({
  imports: [ConfigModule, SecretsManagerModule],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
