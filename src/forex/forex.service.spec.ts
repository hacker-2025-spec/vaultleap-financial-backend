import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import { HttpService } from '@nestjs/axios'
import { of } from 'rxjs'
import { ForexService } from './forex.service'
import { RedisService } from '../redis/redis.service'
import type { CoinGeckoResponse } from './interfaces/forex.interface'

describe('ForexService', () => {
  let service: ForexService
  let httpService: HttpService
  let redisService: RedisService

  const mockCoinGeckoResponse: CoinGeckoResponse = {
    'usd-coin': { usd: 1 },
    tether: { usd: 1 },
    'euro-coin': { usd: 1.1 },
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ForexService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: RedisService,
          useValue: {
            set: jest.fn(),
            get: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<ForexService>(ForexService)
    httpService = module.get<HttpService>(HttpService)
    redisService = module.get<RedisService>(RedisService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('fetchAndStoreForexRates', () => {
    it('should fetch rates from CoinGecko and store in Redis', async () => {
      jest.spyOn(httpService, 'get').mockReturnValue(of({ data: mockCoinGeckoResponse } as any))
      jest.spyOn(redisService, 'set').mockResolvedValue()

      await service.fetchAndStoreForexRates()

      expect(httpService.get).toHaveBeenCalledWith(
        'https://api.coingecko.com/api/v3/simple/price?ids=usd-coin,tether,euro-coin&vs_currencies=usd'
      )
      expect(redisService.set).toHaveBeenCalledTimes(7)
    })
  })

  describe('getForexRates', () => {
    it('should return cached rates from Redis', async () => {
      jest
        .spyOn(redisService, 'get')
        .mockResolvedValueOnce('1.0')
        .mockResolvedValueOnce('1.0')
        .mockResolvedValueOnce('1.1')
        .mockResolvedValueOnce('0.91')
        .mockResolvedValueOnce('0.91')
        .mockResolvedValueOnce('1.0')
        .mockResolvedValueOnce('1234567890')

      const result = await service.getForexRates()

      expect(result).toEqual({
        usdt: {
          usd: 1,
          eur: 0.91,
        },
        usdc: {
          usd: 1,
          eur: 0.91,
        },
        eurc: {
          usd: 1.1,
          eur: 1,
        },
        lastUpdated: 1_234_567_890,
      })
    })

    it('should return null if any rate is missing', async () => {
      jest.spyOn(redisService, 'get').mockResolvedValue(null)

      const result = await service.getForexRates()

      expect(result).toBeNull()
    })
  })
})
