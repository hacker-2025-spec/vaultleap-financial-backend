import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import { DataMapper } from '@nova-odm/mapper'
import { VirtualAccountsService } from './virtual-accounts.service'
import { VirtualAccountEntity } from './virtual-accounts.entity'

describe('VirtualAccountsService', () => {
  let service: VirtualAccountsService
  let dataMapper: DataMapper

  const mockVirtualAccount = Object.assign(new VirtualAccountEntity(), {
    auth0Id: 'test-auth0-id',
    id: 'va_test_123',
    customer_id: 'cust_test_456',
    status: 'active',
    destination_address: '0x1234567890abcdef',
    source_deposit_instructions: {
      currency: 'usd',
      bank_name: 'Test Bank',
      routing_number: '123456789',
      account_number: '987654321',
    },
    destination: {
      payment_rail: 'base',
      currency: 'usdc',
      address: '0x1234567890abcdef',
    },
    developer_fee_percent: '1.0',
    vault_name: 'Test Vault',
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VirtualAccountsService,
        {
          provide: DataMapper,
          useValue: {
            scan: jest.fn(),
          },
        },
        {
          provide: 'BridgeXyzService',
          useValue: {},
        },
        {
          provide: 'EmailSenderService',
          useValue: {},
        },
        {
          provide: 'CustomersService',
          useValue: {},
        },
        {
          provide: 'BankingInfoService',
          useValue: {},
        },
        {
          provide: 'LiquidationAddressesService',
          useValue: {},
        },
        {
          provide: 'AlchemyService',
          useValue: {},
        },
        {
          provide: 'DirectRecipientService',
          useValue: {},
        },
        {
          provide: 'BridgeKYCService',
          useValue: {
            getBridgeKYC: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<VirtualAccountsService>(VirtualAccountsService)
    dataMapper = module.get<DataMapper>(DataMapper)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getVirtualAccountsByCustomerId', () => {
    it('should return virtual accounts for a specific customer ID', async () => {
      const mockPages = {
        async *[Symbol.asyncIterator]() {
          yield [mockVirtualAccount, { ...mockVirtualAccount, customer_id: 'other_customer' }]
        },
      }

      jest.spyOn(dataMapper, 'scan').mockReturnValue({
        pages: () => mockPages,
      } as any)

      const result = await service.getVirtualAccountsByCustomerId('cust_test_456')

      expect(result).toHaveLength(1)
      expect(result[0].customer_id).toBe('cust_test_456')
      expect(result[0].id).toBe('va_test_123')
    })

    it('should return empty array when no virtual accounts found', async () => {
      const mockPages = {
        async *[Symbol.asyncIterator]() {
          yield []
        },
      }

      jest.spyOn(dataMapper, 'scan').mockReturnValue({
        pages: () => mockPages,
      } as any)

      const result = await service.getVirtualAccountsByCustomerId('nonexistent_customer')

      expect(result).toHaveLength(0)
    })
  })

  describe('getVirtualAccountByAuth0Id', () => {
    it('should ensure virtual accounts exist before returning results when KYC is approved', async () => {
      const mockUser = { auth0Id: 'test-auth0-id', privySmartWalletAddress: '0x1234567890abcdef' }
      const mockCustomer = { auth0Id: 'test-auth0-id', bridgeCustomerId: 'cust_123' }
      const mockBridgeKyc = { auth0Id: 'test-auth0-id', kyc_status: 'approved' }

      // Mock customersService.getCustomerByAuth0Id
      jest.spyOn(service['customersService'], 'getCustomerByAuth0Id').mockResolvedValue(mockCustomer as any)

      // Mock bridgeKycService.getBridgeKYC
      jest.spyOn(service['bridgeKycService'], 'getBridgeKYC').mockResolvedValue(mockBridgeKyc as any)

      // Mock the dataMapper.get for user
      jest.spyOn(dataMapper, 'get').mockResolvedValueOnce(mockUser)

      // Mock getVirtualAccountsByCustomerId to return empty array (no existing accounts)
      jest.spyOn(service, 'getVirtualAccountsByCustomerId').mockResolvedValue([])

      // Mock bridgeXyzService.createVirtualAccount
      jest.spyOn(service['bridgeXyzService'], 'createVirtualAccount').mockResolvedValue(mockVirtualAccount as any)

      // Mock saveVirtualAccount
      jest.spyOn(service, 'saveVirtualAccount').mockResolvedValue(mockVirtualAccount)

      // Mock the final query for virtual accounts
      const mockQueryIterator = {
        async *[Symbol.asyncIterator]() {
          yield mockVirtualAccount
        },
      }
      jest.spyOn(dataMapper, 'query').mockReturnValue(mockQueryIterator as any)

      const result = await service.getVirtualAccountByAuth0Id('test-auth0-id')

      expect(result).toHaveLength(1)
      expect(service['bridgeXyzService'].createVirtualAccount).toHaveBeenCalledTimes(2) // USD and EUR
      expect(service.saveVirtualAccount).toHaveBeenCalledTimes(2) // USD and EUR
    })

    it('should not create virtual accounts when KYC is not approved', async () => {
      const mockCustomer = { auth0Id: 'test-auth0-id', bridgeCustomerId: 'cust_123' }
      const mockBridgeKyc = { auth0Id: 'test-auth0-id', kyc_status: 'pending' }

      // Mock customersService.getCustomerByAuth0Id
      jest.spyOn(service['customersService'], 'getCustomerByAuth0Id').mockResolvedValue(mockCustomer as any)

      // Mock bridgeKycService.getBridgeKYC
      jest.spyOn(service['bridgeKycService'], 'getBridgeKYC').mockResolvedValue(mockBridgeKyc as any)

      // Mock the final query for virtual accounts
      const mockQueryIterator = {
        async *[Symbol.asyncIterator]() {
          yield mockVirtualAccount
        },
      }
      jest.spyOn(dataMapper, 'query').mockReturnValue(mockQueryIterator as any)

      const result = await service.getVirtualAccountByAuth0Id('test-auth0-id')

      expect(result).toHaveLength(1)
      expect(service['bridgeXyzService'].createVirtualAccount).not.toHaveBeenCalled()
      expect(service.saveVirtualAccount).not.toHaveBeenCalled()
    })
  })
})
