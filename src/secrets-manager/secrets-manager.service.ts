import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ConfigKeys } from '../config/config.interface'
import type { IConfig } from '../config/config.interface'

@Injectable()
export class SecretsManagerService {
  constructor(private readonly configService: ConfigService<IConfig>) {}

  getBridgeApiKey(): string {
    return this.configService.get(ConfigKeys.BRIDGE_API_KEY, { infer: true }) || ''
  }

  getSumsubApiAppToken(): string {
    return this.configService.get(ConfigKeys.SUMSUB_API_APP_TOKEN, { infer: true }) || ''
  }

  getSumsubApiSecretKey(): string {
    return this.configService.get(ConfigKeys.SUMSUB_API_SECRET_KEY, { infer: true }) || ''
  }

  getPersonaApiToken(): string {
    return this.configService.get(ConfigKeys.PERSONA_API_TOKEN, { infer: true }) || ''
  }

  getAlchemyApiKey(): string {
    return this.configService.get(ConfigKeys.ALCHEMY_API_KEY, { infer: true }) || ''
  }

  getAlchemyAuthToken(): string {
    return this.configService.get(ConfigKeys.ALCHEMY_AUTH_TOKEN, { infer: true }) || ''
  }

  getRedisHost(): string {
    return this.configService.get(ConfigKeys.REDIS_HOST, { infer: true }) || ''
  }

  getRedisPort(): number {
    return Number.parseInt(this.configService.get(ConfigKeys.REDIS_PORT, { infer: true }) || '6379')
  }

  getBullBoardUsername(): string {
    return this.configService.get(ConfigKeys.BULL_BOARD_USERNAME, { infer: true }) || ''
  }

  getBullBoardPassword(): string {
    return this.configService.get(ConfigKeys.BULL_BOARD_PASSWORD, { infer: true }) || ''
  }
}
