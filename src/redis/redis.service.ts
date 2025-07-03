import type { OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Redis, { Cluster } from 'ioredis'
import { ConfigKeys, Environment } from '../config/config.interface'
import { SecretsManagerService } from '../secrets-manager/secrets-manager.service'

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly isLocal: boolean
  constructor(
    private readonly secretManagerService: SecretsManagerService,
    private readonly configService: ConfigService
  ) {
    this.isLocal = this.configService.get(ConfigKeys.REDIS_TLS) !== 'true'
  }
  private client: Redis | Cluster

  onModuleInit(): void {
    const host = this.secretManagerService.getRedisHost()
    const port = this.secretManagerService.getRedisPort()
    const isTLS = this.configService.get(ConfigKeys.REDIS_TLS) === 'true'

    if (isTLS) {
      // TLS enabled means we're using AWS ElastiCache cluster mode
      this.client = new Cluster(
        [
          {
            host,
            port,
          },
        ],
        {
          dnsLookup: (address, callback) => callback(null, address),
          redisOptions: {
            tls: {
              rejectUnauthorized: false,
            },
          },
        }
      )
    } else {
      // Local development - single node mode
      this.client = new Redis({
        host,
        port,
      })
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.quit() // Gracefully closes the Redis connection
    }
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key)
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    await (ttlSeconds ? this.client.set(key, value, 'EX', ttlSeconds) : this.client.set(key, value))
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key)
  }

  async increment(key: string): Promise<number> {
    return this.client.incr(key)
  }

  async disconnect(): Promise<void> {
    await this.client.disconnect()
  }

  getClient(): Redis | Cluster {
    return this.client
  }
}
