import { DataMapper } from '@nova-odm/mapper'
import { BadRequestException, forwardRef, Inject, Injectable, Logger } from '@nestjs/common'
import dayjs from 'dayjs'

import { MSG } from '../consts/exceptions-messages'
import type {
  VirtualAccountActivityItem,
  CreateBridgeVirtualAccountResponseDto,
  VirtualAccountActivity,
} from '../bridge-xyz/bridge-xyz.dto'
import { CreateLiquidationAddressDTO } from '../bridge-xyz/bridge-xyz.dto'
import { BridgeXyzService } from '../bridge-xyz/bridge-xyz.service'
import { VirtualAccountEntity } from './virtual-accounts.entity'
import {
  type CreateVirtualAccountDto,
  type CreateUnifiedAccountDto,
  TransferType,
  type GetUnifiedAccountsQueryDto,
} from './virtual-accounts.dto'
import { EmailSenderService } from '../email-sender/email-sender.service'
import { CustomersService } from '../customers/customers.service'
import type { CustomerEntity } from '../customers/customers.entity'
import { UsersEntity } from '../users/users.entity'
import { BridgeKYCService } from '../bridge-kyc/bridge-kyc.service'
import { BankingInfoService } from '../banking-info/banking-info.service'
import { LiquidationAddressesService } from '../liquidation-addresses/liquidation-addresses.service'
import type { LiquidationAddressEntity } from '../liquidation-addresses/liquidation-addresses.entity'
import { queryRecords } from '../utils/dynamoDbHelpers'
import { DirectRecipientService } from './direct-recipient.service'
import type { DirectRecipientEntity } from './direct-recipient.entity'

@Injectable()
export class VirtualAccountsService {
  private readonly logger = new Logger(VirtualAccountsService.name)
  public constructor(
    @Inject(DataMapper) protected dataMapper: DataMapper,
    @Inject(forwardRef(() => BridgeXyzService))
    private readonly bridgeXyzService: BridgeXyzService,
    private readonly emailSenderService: EmailSenderService,
    private readonly customersService: CustomersService,
    private readonly bankingInfoService: BankingInfoService,
    private readonly liquidationAddressesService: LiquidationAddressesService,
    private readonly directRecipientService: DirectRecipientService,
    private readonly bridgeKycService: BridgeKYCService
  ) {}

  async saveVirtualAccount(
    auth0Id: string,
    createVirtualAccountDto: CreateBridgeVirtualAccountResponseDto,
    vaultName: string
  ): Promise<VirtualAccountEntity> {
    this.logger.log(`VirtualAccountsService -> saveVirtualAccount`, {
      auth0Id,
      createVirtualAccountDto,
      vaultName,
    })

    const isVirtualAccountAlreadyExsits = await this.dataMapper
      .get(Object.assign(new VirtualAccountEntity(), { auth0Id, id: createVirtualAccountDto.id }))
      .catch(() => false)

    if (isVirtualAccountAlreadyExsits) {
      this.logger.log(
        `VirtualAccountsService -> saveVirtualAccount -> virtual account with id: ${createVirtualAccountDto.id}, is already exists for auth0Id: ${auth0Id}`
      )
      throw new BadRequestException(MSG.VIRTUAL_ACCOUNT_EXISTS)
    }

    const newVirtualAccount = Object.assign(new VirtualAccountEntity(), {
      ...createVirtualAccountDto,
      destination_address: createVirtualAccountDto.destination?.address,
      auth0Id,
      vault_name: vaultName,
    })

    const createdVirtualAccount = await this.dataMapper.put(newVirtualAccount)
    return createdVirtualAccount
  }

  private async ensureVirtualAccountsExist(auth0Id: string): Promise<void> {
    this.logger.log(`VirtualAccountsService -> ensureVirtualAccountsExist -> auth0Id: ${auth0Id}`)

    try {
      // Get customer and user information
      const customer = await this.customersService.getCustomerByAuth0Id(auth0Id)
      if (!customer) {
        this.logger.warn(`VirtualAccountsService -> ensureVirtualAccountsExist -> Customer not found for auth0Id: ${auth0Id}`)
        return
      }

      // Check if KYC is approved - only create virtual accounts if KYC is approved
      const bridgeKyc = await this.bridgeKycService.getBridgeKYC(auth0Id)
      if (!bridgeKyc || bridgeKyc.kyc_status !== 'approved') {
        this.logger.log(
          `VirtualAccountsService -> ensureVirtualAccountsExist -> KYC not approved for auth0Id: ${auth0Id}, status: ${bridgeKyc?.kyc_status || 'unknown'}`
        )
        return
      }

      // Get user to find smart wallet address
      const user = await this.dataMapper.get(Object.assign(new UsersEntity(), { auth0Id }))
      if (!user?.privySmartWalletAddress) {
        this.logger.warn(`VirtualAccountsService -> ensureVirtualAccountsExist -> Smart wallet address not found for auth0Id: ${auth0Id}`)
        return
      }

      // Get existing virtual accounts for this customer
      const existingVirtualAccounts = await this.getVirtualAccountsByCustomerId(customer.bridgeCustomerId)

      const hasUsdAccount = existingVirtualAccounts.some(
        (account) =>
          account.source_deposit_instructions &&
          'currency' in account.source_deposit_instructions &&
          account.source_deposit_instructions.currency === 'usd' &&
          account.destination_address === user.privySmartWalletAddress
      )

      const hasEurAccount = existingVirtualAccounts.some(
        (account) =>
          account.source_deposit_instructions &&
          'currency' in account.source_deposit_instructions &&
          account.source_deposit_instructions.currency === 'eur' &&
          account.destination_address === user.privySmartWalletAddress
      )

      this.logger.log(`VirtualAccountsService -> ensureVirtualAccountsExist -> USD: ${hasUsdAccount}, EUR: ${hasEurAccount}`)

      // Create missing virtual accounts
      const promises = []

      if (!hasUsdAccount) {
        promises.push(this.createMissingVirtualAccount(customer.bridgeCustomerId, 'usd', user.privySmartWalletAddress, auth0Id))
      }

      if (!hasEurAccount) {
        promises.push(this.createMissingVirtualAccount(customer.bridgeCustomerId, 'eur', user.privySmartWalletAddress, auth0Id))
      }

      if (promises.length > 0) {
        await Promise.allSettled(promises)
        this.logger.log(`VirtualAccountsService -> ensureVirtualAccountsExist -> Created ${promises.length} missing virtual accounts`)
      }
    } catch (error) {
      this.logger.error(`VirtualAccountsService -> ensureVirtualAccountsExist -> failure`, error)
    }
  }

  private async createMissingVirtualAccount(
    customerId: string,
    currency: 'usd' | 'eur',
    destinationAddress: string,
    auth0Id: string
  ): Promise<void> {
    try {
      const virtualAccountData = {
        source: { currency },
        destination: {
          payment_rail: 'base',
          currency: 'usdc' as const,
          address: destinationAddress,
        },
        developer_fee_percent: '0',
      }

      this.logger.log(`VirtualAccountsService -> createMissingVirtualAccount -> Creating ${currency.toUpperCase()} virtual account`)

      // Create virtual account on Bridge
      const bridgeVirtualAccount = await this.bridgeXyzService.createVirtualAccount(customerId, virtualAccountData)

      // Save virtual account to DynamoDB
      await this.saveVirtualAccount(auth0Id, bridgeVirtualAccount, 'Auto-created Virtual Account')

      this.logger.log(
        `VirtualAccountsService -> createMissingVirtualAccount -> ${currency.toUpperCase()} virtual account created and saved`
      )
    } catch (error) {
      this.logger.error(`VirtualAccountsService -> createMissingVirtualAccount -> ${currency.toUpperCase()} account creation failed`, error)
      throw error
    }
  }

  async getVirtualAccountByAuth0Id(auth0Id: string): Promise<VirtualAccountEntity[]> {
    try {
      // First, ensure both EUR and USD virtual accounts exist
      await this.ensureVirtualAccountsExist(auth0Id)

      // Then fetch and return all virtual accounts
      const iterator = this.dataMapper.query(VirtualAccountEntity, { auth0Id })

      const results = []
      for await (const record of iterator) {
        results.push(record)
      }
      return results
    } catch (error) {
      this.logger.error(`VirtualAccountsService -> getVirtualAccountByAuth0Id -> failure`, error)
      throw new BadRequestException(MSG.VIRTUAL_ACCOUNTS_NOT_FOUND)
    }
  }

  async getVirtualAccountById(auth0Id: string, id: string): Promise<VirtualAccountEntity> {
    try {
      return await this.dataMapper.get(Object.assign(new VirtualAccountEntity(), { auth0Id, id }))
    } catch {
      this.logger.log(`VirtualAccountsService -> getVirtualAccountById -> virtual account for auth0Id: ${auth0Id} and id: ${id} not found`)
      throw new BadRequestException(MSG.VIRTUAL_ACCOUNT_NOT_FOUND)
    }
  }

  async getVirtualAccountByIdOnly(id: string): Promise<VirtualAccountEntity | null> {
    this.logger.log('VirtualAccountsService -> getVirtualAccountByIdOnly -> id', id)

    const iterator = this.dataMapper.scan(VirtualAccountEntity, { limit: 100 }).pages()

    for await (const page of iterator) {
      const virtualAccount = page.find((account) => account.id === id)

      if (virtualAccount) {
        return virtualAccount
      }
    }

    return null
  }

  async getVirtualAccountsByCustomerId(customerId: string): Promise<VirtualAccountEntity[]> {
    this.logger.log('VirtualAccountsService -> getVirtualAccountsByCustomerId -> customerId', customerId)

    try {
      const iterator = this.dataMapper.scan(VirtualAccountEntity, { limit: 100 }).pages()
      const results: VirtualAccountEntity[] = []

      for await (const page of iterator) {
        const matchingAccounts = page.filter((account) => account.customer_id === customerId)
        results.push(...matchingAccounts)
      }

      return results
    } catch (error) {
      this.logger.error('VirtualAccountsService -> getVirtualAccountsByCustomerId -> failure', error)
      return []
    }
  }

  // async sendVirtualAccountCreatorEmail(virtualAccountEntity: VirtualAccountEntity, customerEntity: CustomerEntity): Promise<void> {
  //   const { developer_fee_percent, destination, source_deposit_instructions: source } = virtualAccountEntity
  //   const { first_name, last_name, email } = customerEntity

  //   await this.emailSenderService.sendVirtualAccountSummaryEmail({
  //     creatorFullName: `${first_name} ${last_name}`,
  //     email,
  //     vaultFeePercentage: Number.parseFloat(developer_fee_percent),

  //     destination: {
  //       paymentRail: destination.payment_rail,
  //       vaultAddress: destination.address,
  //       currency: destination.currency,
  //     },

  //     source: {
  //       bankName: source.bank_name,
  //       currency: source.currency,

  //       ...('iban' in source
  //         ? { accountHolderName: source.account_holder_name, bic: source.bic, iban: source.iban }
  //         : {
  //             ...(source.bank_beneficiary_name && { bankBeneficiaryName: source.bank_beneficiary_name }),
  //             accountNumber: source.bank_account_number,
  //             routingNumber: source.bank_routing_number,
  //           }),
  //     },
  //   })
  // }

  async createVirtualAccount(
    auth0Id: string,
    { bridgeCustomerId, virtualAccountData, vaultName }: CreateVirtualAccountDto
  ): Promise<VirtualAccountEntity> {
    this.logger.log('VirtualAccountsService -> createVirtualAccount -> data', {
      auth0Id,
      bridgeCustomerId,
      virtualAccountData,
      vaultName,
    })
    try {
      const customerEntity = await this.customersService.getCustomerByBridgeCustomerId(bridgeCustomerId)

      if (!customerEntity) {
        throw new Error('Customer with specified id does not exist in local DB')
      }

      const virtualAccount = await this.bridgeXyzService.createVirtualAccount(bridgeCustomerId, virtualAccountData)
      this.logger.log('VirtualAccountsService -> createVirtualAccount -> virtual account from bridge', virtualAccount)
      const virtualAccountEntity = await this.saveVirtualAccount(auth0Id, virtualAccount, vaultName)

      return virtualAccountEntity
    } catch (error) {
      this.logger.error('VirtualAccountsService -> createVirtualAccount -> failure', error?.response?.data || error.message)
      throw error
    }
  }

  async updateVirtualAccountById(auth0Id: string, virtualAccountId: string): Promise<VirtualAccountEntity | void> {
    this.logger.log('VirtualAccountsService -> updateVirtualAccountById -> data', {
      auth0Id,
      virtualAccountId,
    })
    try {
      const { customer_id, vault_name } = await this.getVirtualAccountById(auth0Id, virtualAccountId)
      const virtualAccount = await this.bridgeXyzService.getVirtualAccountById(customer_id, virtualAccountId)
      this.logger.log('VirtualAccountsService -> updateVirtualAccountById -> virtual account from bridge', virtualAccount)

      const updatedVirtualAccount = Object.assign(new VirtualAccountEntity(), {
        ...virtualAccount,
        destination_address: virtualAccount.destination?.address,
        customer_id,
        auth0Id,
        vault_name,
      })

      return await this.dataMapper.put(updatedVirtualAccount)
    } catch (error) {
      this.logger.error('VirtualAccountsService -> updateVirtualAccountById -> failure', error?.response?.data || error.message)
      throw error
    }
  }

  async getVirtualAccountActivity({
    auth0Id,
    virtualAccountId,
    customerId,
    eventType = 'funds_received',
  }: {
    auth0Id: string
    virtualAccountId: string
    customerId: string
    eventType?: string
  }): Promise<VirtualAccountActivity> {
    this.logger.log('VirtualAccountsService -> getVirtualAccountActivity -> data', {
      auth0Id,
      customerId,
      virtualAccountId,
      eventType,
    })

    try {
      const VirtualAccountActivity = await this.bridgeXyzService.getVirtualAccountActivity(customerId, virtualAccountId, {
        event_type: eventType,
      })

      this.logger.log(
        'VirtualAccountsService -> getVirtualAccountActivity -> virtual account activity count',
        VirtualAccountActivity.length
      )
      return VirtualAccountActivity
    } catch (error) {
      this.logger.error('VirtualAccountsService -> getVirtualAccountActivity -> failure', error?.response?.data || error.message)
      throw error
    }
  }

  async getVirtualAccountActivityPaginated({
    auth0Id,
    virtualAccountId,
    customerId,
    limit,
    startingAfterId,
    endingBeforeId,
    eventType,
  }: {
    auth0Id: string
    virtualAccountId: string
    customerId: string
    limit?: number
    startingAfterId?: string
    endingBeforeId?: string
    eventType?: string
  }): Promise<VirtualAccountActivity> {
    this.logger.log('VirtualAccountsService -> getVirtualAccountActivityPaginated -> data', {
      auth0Id,
      customerId,
      virtualAccountId,
      limit,
      startingAfterId,
      endingBeforeId,
      eventType,
    })

    try {
      const VirtualAccountActivity = await this.bridgeXyzService.getVirtualAccountActivityPaginated(customerId, virtualAccountId, {
        limit,
        startingAfterId,
        endingBeforeId,
        event_type: eventType,
      })

      this.logger.log(
        'VirtualAccountsService -> getVirtualAccountActivityPaginated -> virtual account activity count',
        VirtualAccountActivity.length
      )
      return VirtualAccountActivity
    } catch (error) {
      this.logger.error('VirtualAccountsService -> getVirtualAccountActivityPaginated -> failure', error?.response?.data || error.message)
      throw error
    }
  }

  async sendVirtualAccountFundsSentEmail(
    virtualAccountActivity: VirtualAccountActivityItem,
    customer: CustomerEntity,
    virtualAccount: VirtualAccountEntity
  ) {
    const { first_name, last_name, email } = customer
    const { vault_name } = virtualAccount
    const { amount, currency, created_at } = virtualAccountActivity

    await this.emailSenderService.sendVirtualAccountFundsSentEmail({
      fullName: `${first_name} ${last_name}`,
      vaultName: vault_name,
      amount,
      date: dayjs(new Date(created_at)).format('MM/DD/YYYY'),
      currency,
      email,
    })
  }

  async processVirtualAccountPaymentProcessedEvent(virtualAccountActivity: VirtualAccountActivityItem) {
    this.logger.log(
      'LiquidationAddressesService -> processVirtualAccountFundsReceivedEvent -> virtualAccountActivity',
      virtualAccountActivity
    )

    const { customer_id, virtual_account_id } = virtualAccountActivity

    const customer = await this.customersService.getCustomerByBridgeCustomerId(customer_id)

    if (!customer) {
      return this.logger.log('LiquidationAddressesService -> processVirtualAccountFundsReceivedEvent -> customer not found', customer_id)
    }

    const virtualAccount = await this.getVirtualAccountById(customer.auth0Id, virtual_account_id)

    if (!virtualAccount) {
      return this.logger.log(
        'LiquidationAddressesService -> processVirtualAccountFundsReceivedEvent -> virtual account not found',
        virtual_account_id
      )
    }
  }

  async createUnifiedAccount(auth0Id: string, data: CreateUnifiedAccountDto): Promise<LiquidationAddressEntity | DirectRecipientEntity> {
    this.logger.log('VirtualAccountsService -> createUnifiedAccount -> data', { auth0Id, data })

    try {
      const {
        vaultName,
        transferType,
        feePercentage = '0',
        chain = 'base',
        currency = 'usdc',
        destinationPaymentRail,
        destinationCurrency,
        destinationAddress,
        bankingInfo,
        destinationWireMessage,
        destinationSepaReference,
      } = data

      // Handle direct Web3 transfers
      if (transferType === TransferType.DIRECT_WEB3) {
        if (!destinationAddress) {
          throw new BadRequestException('Destination address is required for direct Web3 transfers')
        }

        // Validate supported currencies and chains for direct Web3 transfers
        if (chain !== 'base') {
          throw new BadRequestException('Direct Web3 transfers currently only support Base chain')
        }

        if (!['usdc', 'eurc'].includes(currency)) {
          throw new BadRequestException('Direct Web3 transfers currently only support USDC and EURC currencies')
        }

        this.logger.log('VirtualAccountsService -> createUnifiedAccount -> creating direct Web3 recipient')

        return await this.directRecipientService.createDirectRecipient(
          auth0Id,
          vaultName,
          destinationAddress,
          chain,
          currency,
          feePercentage
        )
      }

      // Handle traditional Bridge flow
      const customer = await this.customersService.getCustomerByAuth0Id(auth0Id)
      if (!customer) throw new BadRequestException(MSG.CUSTOMER_NOT_FOUND)

      const isCryptoDestination = destinationPaymentRail === 'base'
      let externalAccountId: string | undefined

      if (isCryptoDestination) {
        if (!destinationAddress) {
          throw new BadRequestException('Destination address is required for crypto destinations')
        }
      } else {
        if (!bankingInfo) {
          throw new BadRequestException('Banking information is required for fiat destinations')
        }

        const bridgeExternalAccount = await this.bridgeXyzService.createExternalAccount(customer.bridgeCustomerId, bankingInfo)
        const savedBankingInfo = await this.bankingInfoService.saveBankingInfo(auth0Id, bridgeExternalAccount)
        if (!savedBankingInfo) throw new BadRequestException(MSG.BRIDGE_EXTERNAL_ACCOUNT_EXISTS)

        externalAccountId = bridgeExternalAccount.id
      }

      const liquidationAddressInfo = Object.assign(new CreateLiquidationAddressDTO(), {
        chain,
        currency,
        ...(feePercentage && { custom_developer_fee_percent: feePercentage }),
        ...(externalAccountId && { external_account_id: externalAccountId }),
        destination_payment_rail: destinationPaymentRail,
        destination_currency: destinationCurrency,
        ...(destinationAddress && { destination_address: destinationAddress }),
        ...(destinationWireMessage && { destination_wire_message: destinationWireMessage }),
        ...(destinationSepaReference && { destination_sepa_reference: destinationSepaReference }),
      })

      this.logger.log('VirtualAccountsService -> createUnifiedAccount -> liquidationAddressInfo', liquidationAddressInfo)

      const liquidationAddress = await this.bridgeXyzService.createLiquidationAddress(customer.bridgeCustomerId, liquidationAddressInfo)
      if (!liquidationAddress) throw new BadRequestException(MSG.LIQUIDATION_ADDRESS_WRONG_PARAMS)

      return await this.liquidationAddressesService.saveLiquidationAddress(auth0Id, liquidationAddress, vaultName)
    } catch (error) {
      this.logger.error('VirtualAccountsService -> createUnifiedAccount -> failure', error?.response?.data || error.message)
      throw error
    }
  }

  async getVirtualAccountByAddress(address: string): Promise<VirtualAccountEntity | null> {
    const records = await queryRecords<VirtualAccountEntity>(
      this.dataMapper,
      { destination_address: address },
      { indexName: 'destinationAddressIndex' },
      VirtualAccountEntity
    )

    return records[0] ?? null
  }
  async getUnifiedAccounts(
    auth0Id: string,
    query: GetUnifiedAccountsQueryDto
  ): Promise<{
    bridgeAccounts: LiquidationAddressEntity[]
    directRecipients: DirectRecipientEntity[]
    total: number
  }> {
    this.logger.log('VirtualAccountsService -> getUnifiedAccounts -> data', { auth0Id, query })

    try {
      const { transferType, vaultName } = query
      let bridgeAccounts: LiquidationAddressEntity[] = []
      let directRecipients: DirectRecipientEntity[] = []

      // Fetch Bridge accounts if not filtering for direct_web3 only
      if (!transferType || transferType === TransferType.BRIDGE) {
        try {
          bridgeAccounts = await this.liquidationAddressesService.getLiquidationAddressByAuth0Id(auth0Id)

          // Filter by vault name if specified
          if (vaultName) {
            bridgeAccounts = bridgeAccounts.filter((account) => account.vault_name?.toLowerCase().includes(vaultName.toLowerCase()))
          }
        } catch {
          // No bridge accounts found, continue
          bridgeAccounts = []
        }
      }

      // Fetch Direct recipients if not filtering for bridge only
      if (!transferType || transferType === TransferType.DIRECT_WEB3) {
        try {
          directRecipients = await this.directRecipientService.getDirectRecipientsByAuth0Id(auth0Id)

          // Filter by vault name if specified
          if (vaultName) {
            directRecipients = directRecipients.filter((recipient) => recipient.vaultName?.toLowerCase().includes(vaultName.toLowerCase()))
          }
        } catch {
          // No direct recipients found, continue
          directRecipients = []
        }
      }

      const total = bridgeAccounts.length + directRecipients.length

      return {
        bridgeAccounts,
        directRecipients,
        total,
      }
    } catch (error) {
      this.logger.error('VirtualAccountsService -> getUnifiedAccounts -> failure', error)
      throw error
    }
  }
}
