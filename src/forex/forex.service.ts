import type { OnModuleInit } from '@nestjs/common'
import { Injectable, Logger } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import { RedisService } from '../redis/redis.service'
import {
  FOREX_RATE_USDT_USD_KEY,
  FOREX_RATE_USDC_USD_KEY,
  FOREX_RATE_EURC_USD_KEY,
  FOREX_RATE_USDT_EUR_KEY,
  FOREX_RATE_USDC_EUR_KEY,
  FOREX_RATE_EURC_EUR_KEY,
  FOREX_RATES_LAST_UPDATED_KEY,
} from '../redis/keys.contants'
import type { CoinGeckoResponse, ForexRatesCache } from './interfaces/forex.interface'

@Injectable()
export class ForexService implements OnModuleInit {
  private readonly logger = new Logger(ForexService.name)
  private readonly coinGeckoUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=usd-coin,tether,euro-coin&vs_currencies=usd'

  constructor(
    private readonly httpService: HttpService,
    private readonly redisService: RedisService
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      this.logger.log('Initializing forex service - fetching initial rates')
      await this.fetchAndStoreForexRates()
    } catch (error) {
      this.logger.error('Failed to fetch initial forex rates on module init', error.stack)
    }
  }

  async fetchAndStoreForexRates(): Promise<void> {
    try {
      this.logger.log('Fetching forex rates from CoinGecko API')

      const response = await firstValueFrom(this.httpService.get<CoinGeckoResponse>(this.coinGeckoUrl))

      const rates = response.data
      const timestamp = Date.now()

      const usdcUsdRate = rates['usd-coin'].usd
      const tetherUsdRate = rates.tether.usd
      const eurcUsdRate = rates['euro-coin'].usd

      const eurToUsdRate = 1 / eurcUsdRate
      const usdcEurRate = usdcUsdRate * eurToUsdRate
      const tetherEurRate = tetherUsdRate * eurToUsdRate
      const eurcEurRate = 1

      await Promise.all([
        this.redisService.set(FOREX_RATE_USDC_USD_KEY, usdcUsdRate.toString()),
        this.redisService.set(FOREX_RATE_USDT_USD_KEY, tetherUsdRate.toString()),
        this.redisService.set(FOREX_RATE_EURC_USD_KEY, eurcUsdRate.toString()),
        this.redisService.set(FOREX_RATE_USDC_EUR_KEY, usdcEurRate.toString()),
        this.redisService.set(FOREX_RATE_USDT_EUR_KEY, tetherEurRate.toString()),
        this.redisService.set(FOREX_RATE_EURC_EUR_KEY, eurcEurRate.toString()),
        this.redisService.set(FOREX_RATES_LAST_UPDATED_KEY, timestamp.toString()),
      ])

      this.logger.log(`Forex rates updated successfully: USDC=${usdcUsdRate} USD, USDT=${tetherUsdRate} USD, EURC=${eurcUsdRate} USD`)
    } catch (error) {
      this.logger.error('Failed to fetch or store forex rates', error.stack)
      throw error
    }
  }

  async getForexRates(): Promise<ForexRatesCache | null> {
    try {
      const [usdtUsd, usdcUsd, eurcUsd, usdtEur, usdcEur, eurcEur, lastUpdated] = await Promise.all([
        this.redisService.get(FOREX_RATE_USDT_USD_KEY),
        this.redisService.get(FOREX_RATE_USDC_USD_KEY),
        this.redisService.get(FOREX_RATE_EURC_USD_KEY),
        this.redisService.get(FOREX_RATE_USDT_EUR_KEY),
        this.redisService.get(FOREX_RATE_USDC_EUR_KEY),
        this.redisService.get(FOREX_RATE_EURC_EUR_KEY),
        this.redisService.get(FOREX_RATES_LAST_UPDATED_KEY),
      ])

      if (!usdtUsd || !usdcUsd || !eurcUsd || !usdtEur || !usdcEur || !eurcEur || !lastUpdated) {
        return null
      }

      return {
        usdt: {
          usd: Number.parseFloat(usdtUsd),
          eur: Number.parseFloat(usdtEur),
        },
        usdc: {
          usd: Number.parseFloat(usdcUsd),
          eur: Number.parseFloat(usdcEur),
        },
        eurc: {
          usd: Number.parseFloat(eurcUsd),
          eur: Number.parseFloat(eurcEur),
        },
        lastUpdated: Number.parseInt(lastUpdated, 10),
      }
    } catch (error) {
      this.logger.error('Failed to retrieve forex rates from Redis', error.stack)
      return null
    }
  }

  async getForexRate(symbol: 'usdt' | 'usdc' | 'eurc', currency: 'usd' | 'eur' = 'usd'): Promise<number | null> {
    try {
      const keyMap = {
        usdt: {
          usd: FOREX_RATE_USDT_USD_KEY,
          eur: FOREX_RATE_USDT_EUR_KEY,
        },
        usdc: {
          usd: FOREX_RATE_USDC_USD_KEY,
          eur: FOREX_RATE_USDC_EUR_KEY,
        },
        eurc: {
          usd: FOREX_RATE_EURC_USD_KEY,
          eur: FOREX_RATE_EURC_EUR_KEY,
        },
      }

      const rate = await this.redisService.get(keyMap[symbol][currency])
      return rate ? Number.parseFloat(rate) : null
    } catch (error) {
      this.logger.error(`Failed to retrieve ${symbol} ${currency.toUpperCase()} forex rate from Redis`, error.stack)
      return null
    }
  }
}
