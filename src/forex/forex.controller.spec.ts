import { Test, TestingModule } from '@nestjs/testing'
import { ForexController } from './forex.controller'
import { ForexService } from './forex.service'
import { BaseUserGuard } from '../auth/baseUser.guard'
import { UsersEntity } from '../users/users.entity'
import type { ForexRatesCache } from './interfaces/forex.interface'

describe('ForexController', () => {
  let controller: ForexController
  let forexService: ForexService

  const mockForexRates: ForexRatesCache = {
    usdt: { usd: 1.0, eur: 0.91 },
    usdc: { usd: 1.0, eur: 0.91 },
    eurc: { usd: 1.1, eur: 1.0 },
    lastUpdated: 1234567890,
  }

  const mockUser = Object.assign(new UsersEntity(), {
    auth0Id: 'test-user-id',
    email: 'test@example.com',
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ForexController],
      providers: [
        {
          provide: ForexService,
          useValue: {
            getForexRates: jest.fn(),
            fetchAndStoreForexRates: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(BaseUserGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile()

    controller = module.get<ForexController>(ForexController)
    forexService = module.get<ForexService>(ForexService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('getForexRates', () => {
    it('should return forex rates', async () => {
      jest.spyOn(forexService, 'getForexRates').mockResolvedValue(mockForexRates)

      const result = await controller.getForexRates()

      expect(result).toEqual(mockForexRates)
      expect(forexService.getForexRates).toHaveBeenCalled()
    })
  })

  describe('getUserForexRates', () => {
    it('should return forex rates for authenticated user', async () => {
      jest.spyOn(forexService, 'getForexRates').mockResolvedValue(mockForexRates)

      const result = await controller.getUserForexRates(mockUser)

      expect(result).toEqual(mockForexRates)
      expect(forexService.getForexRates).toHaveBeenCalled()
    })
  })

  describe('fetchForexRates', () => {
    it('should trigger manual forex rates fetch', async () => {
      jest.spyOn(forexService, 'fetchAndStoreForexRates').mockResolvedValue()

      const result = await controller.fetchForexRates()

      expect(result).toEqual({ message: 'Forex rates updated successfully' })
      expect(forexService.fetchAndStoreForexRates).toHaveBeenCalled()
    })
  })
})
