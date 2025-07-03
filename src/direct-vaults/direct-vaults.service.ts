import { DataMapper } from '@nova-odm/mapper'
import { BadRequestException, forwardRef, Inject, Injectable, Logger } from '@nestjs/common'

import { BridgeKYCService } from '../bridge-kyc/bridge-kyc.service'
import type { CreateBankingInfoDto, CreateCustomerDTO, CreateLiquidationAddressShortDTO } from './direct-vaults.dto'
import type { BridgeKYCEntity } from '../bridge-kyc/bridge-kyc.entity'
import type {
  BridgeLiqAddressDrainDTO,
  CreateCustomerFromKycResponseDTO,
  CreateLiquidationAddressDTO,
  CreateLiquidationAddressResponseDTO,
  GetLiqAddressDrainHistoryResponseDTO,
} from '../bridge-xyz/bridge-xyz.dto'
import { CustomersService } from '../customers/customers.service'
import { BankingInfoService } from '../banking-info/banking-info.service'
import { MSG } from '../consts/exceptions-messages'
import type { LiquidationAddressEntity } from '../liquidation-addresses/liquidation-addresses.entity'
import { LiquidationAddressesService } from '../liquidation-addresses/liquidation-addresses.service'
import { EmailSenderService } from '../email-sender/email-sender.service'
import { UsersService } from '../users/users.service'
import type { CustomerEntity } from '../customers/customers.entity'
import type { BankingInfoEntity } from '../banking-info/banking-info.entity'
import dayjs from 'dayjs'
import { v4 as uuid } from 'uuid'
import { BridgeXyzService } from '../bridge-xyz/bridge-xyz.service'
import { VirtualAccountsService } from '../virtual-accounts/virtual-accounts.service'

@Injectable()
export class DirectVaultsService {
  private readonly logger = new Logger(DirectVaultsService.name)
  public constructor(
    @Inject(DataMapper) protected dataMapper: DataMapper,
    @Inject(forwardRef(() => BridgeXyzService))
    private readonly bridgeXyzService: BridgeXyzService,
    @Inject(BridgeKYCService) protected bridgeKYCService: BridgeKYCService,
    @Inject(CustomersService) protected customersService: CustomersService,
    @Inject(BankingInfoService) protected bankingInfoService: BankingInfoService,
    @Inject(LiquidationAddressesService) protected liquidationAddressesService: LiquidationAddressesService,
    @Inject(EmailSenderService) protected emailSenderService: EmailSenderService,
    @Inject(UsersService) protected usersService: UsersService,
    @Inject(forwardRef(() => VirtualAccountsService)) protected virtualAccountsService: VirtualAccountsService
  ) {}

  /**
   * Generates a unique signed agreement ID for TOS attestation
   * This ID can be used to track and verify TOS acceptance
   */
  private generateSignedAgreementId(auth0Id: string): string {
    const timestamp = new Date().toISOString().replaceAll(/[.:]/g, '').slice(0, -1)
    const userIdHash = auth0Id.slice(-8) // Last 8 chars of auth0Id for brevity
    const referenceId = uuid().slice(0, 8)

    return `tos_${userIdHash}_${timestamp}_${referenceId}`
  }

  async createCustomer(
    auth0Id: string,
    { customer, privyWalletAddress, privySmartWalletAddress }: CreateCustomerDTO
  ): Promise<BridgeKYCEntity> {
    this.logger.log(`DirectVaultsService -> createCustomer, auth0Id:${auth0Id}`, {
      customer: { full_name: customer.full_name, email: customer.email, type: customer.type },
      privyWalletAddress,
      privySmartWalletAddress,
    })

    try {
      // Create KYC link with TOS reliance
      const KYCLinkObject = await this.bridgeXyzService.createCustomerWithKYC(customer)
      const savedKYCLinkObject = await this.bridgeKYCService.saveBridgeKYC(auth0Id, KYCLinkObject)
      if (!savedKYCLinkObject) throw new BadRequestException(MSG.BRIDGE_KYC_EXISTS)

      // Generate signed agreement ID for TOS attestation
      const signedAgreementId = this.generateSignedAgreementId(auth0Id)

      // Update customer with TOS acceptance
      // await this.bridgeXyzService.updateCustomerById(savedKYCLinkObject.customer_id, signedAgreementId)
      const bridgeCustomer = await this.bridgeXyzService.getCustomerById(savedKYCLinkObject.customer_id)

      const savedCustomer = await this.customersService.create(auth0Id, bridgeCustomer)

      if (!savedCustomer) throw new BadRequestException(MSG.BRIDGE_CUSTOMER_EXISTS)

      // Update user entity with Privy wallet addresses
      await this.usersService.updatePrivyWalletAddresses(auth0Id, privyWalletAddress, privySmartWalletAddress)

      return savedKYCLinkObject
    } catch (error) {
      this.logger.error(`DirectVaultsService -> createCustomer -> failure`, error)
      throw error
    }
  }

  async createBankingAccount(auth0Id: string, { bridgeCustomerId, bankingInfo }: CreateBankingInfoDto): Promise<BankingInfoEntity> {
    this.logger.log(`DirectVaultsService -> createBankingAccount, auth0Id:${auth0Id}`, { bridgeCustomerId, bankingInfo })
    try {
      const bridgeExternalAccount = await this.bridgeXyzService.createExternalAccount(bridgeCustomerId, bankingInfo)
      const savedBankingInfo = await this.bankingInfoService.saveBankingInfo(auth0Id, bridgeExternalAccount)
      if (!savedBankingInfo) throw new BadRequestException(MSG.BRIDGE_EXTERNAL_ACCOUNT_EXISTS)
      return savedBankingInfo
    } catch (error) {
      this.logger.error(`DirectVaultsService -> createBankingAccount -> failure`, error)
      throw error
    }
  }

  async checkKYC(auth0Id: string, bridgeKYCId: string): Promise<CreateCustomerFromKycResponseDTO> {
    this.logger.log(`DirectVaultsService -> checkKYC, kycLinkId:${bridgeKYCId}`)
    this.logger.log(`test`)
    const newKYCStatus = await this.bridgeXyzService
      .checkKycStatus(bridgeKYCId)
      .catch(() => this.logger.error(`DirectVaultsService -> checkKYC -> failure`))

    this.logger.log(`DirectVaultsService -> checkKYC, fixes:${bridgeKYCId},${JSON.stringify(newKYCStatus)}`)

    if (!newKYCStatus) throw new BadRequestException(MSG.BRIDGE_KYC_LINK_NOT_FOUND)
    void this.bridgeKYCService.updateBridgeKYC(auth0Id, newKYCStatus)

    let virtualAccountsCreated = false

    if (newKYCStatus.customer_id && newKYCStatus.kyc_status === 'approved') {
      try {
        const user = await this.usersService.getUserById(auth0Id)
        console.log('existing acc', user)
        if (user.privySmartWalletAddress) {
          virtualAccountsCreated = await this.ensureVirtualAccountsExist(newKYCStatus.customer_id, user.privySmartWalletAddress)
        }
      } catch (error) {
        this.logger.error(`DirectVaultsService -> checkKYC -> virtual accounts creation failed`, error)
      }
    }

    return {
      ...newKYCStatus,
      virtualAccountsCreated,
    }
  }

  private async ensureVirtualAccountsExist(customerId: string, destinationAddress: string): Promise<boolean> {
    this.logger.log(`DirectVaultsService -> ensureVirtualAccountsExist, customerId:${customerId}`)

    try {
      const existingVirtualAccounts = await this.virtualAccountsService.getVirtualAccountsByCustomerId(customerId)
      this.logger.log('existing virtual accounts from database', existingVirtualAccounts.length)

      let hasUsdAccount =
        existingVirtualAccounts?.some(
          (account) =>
            account.source_deposit_instructions &&
            'currency' in account.source_deposit_instructions &&
            account.source_deposit_instructions.currency === 'usd' &&
            account.destination_address === destinationAddress
        ) ?? false

      let hasEurAccount =
        existingVirtualAccounts?.some(
          (account) =>
            account.source_deposit_instructions &&
            'currency' in account.source_deposit_instructions &&
            account.source_deposit_instructions.currency === 'eur' &&
            account.destination_address === destinationAddress
        ) ?? false

      this.logger.log(`Virtual accounts status: USD=${hasUsdAccount}, EUR=${hasEurAccount}`)

      // Create USD account if missing
      if (!hasUsdAccount) {
        try {
          await this.createVirtualAccount(customerId, 'usd', destinationAddress)
          hasUsdAccount = true
          this.logger.log(`DirectVaultsService -> ensureVirtualAccountsExist -> USD virtual account created`)
        } catch (error) {
          this.logger.error(`DirectVaultsService -> ensureVirtualAccountsExist -> USD account creation failed`, error)
        }
      }

      // Create EUR account if missing (independent of USD creation result)
      if (!hasEurAccount) {
        try {
          await this.createVirtualAccount(customerId, 'eur', destinationAddress)
          hasEurAccount = true
          this.logger.log(`DirectVaultsService -> ensureVirtualAccountsExist -> EUR virtual account created`)
        } catch (error) {
          this.logger.error(`DirectVaultsService -> ensureVirtualAccountsExist -> EUR account creation failed`, error)
        }
      }

      return hasEurAccount && hasUsdAccount
    } catch (error) {
      this.logger.error(`DirectVaultsService -> ensureVirtualAccountsExist -> failure`, error)
      return false
    }
  }

  private async createVirtualAccount(customerId: string, currency: 'usd' | 'eur', destinationAddress: string): Promise<void> {
    const virtualAccountData = {
      source: { currency },
      destination: {
        payment_rail: 'base',
        currency: 'usdc' as const,
        address: destinationAddress,
      },
      developer_fee_percent: '0',
    }
    this.logger.log('DirectVaultsService -> createVirtualAccount -> creating virtual account', virtualAccountData)

    // Create virtual account on Bridge
    const bridgeVirtualAccount = await this.bridgeXyzService.createVirtualAccount(customerId, virtualAccountData)

    // Get customer to find auth0Id for saving to database
    const customer = await this.customersService.getCustomerByBridgeCustomerId(customerId)
    if (customer) {
      // Save virtual account to DynamoDB
      await this.virtualAccountsService.saveVirtualAccount(customer.auth0Id, bridgeVirtualAccount, 'Direct Vault')
      this.logger.log(`DirectVaultsService -> createVirtualAccount -> ${currency.toUpperCase()} virtual account saved to database`)
    } else {
      this.logger.warn(`DirectVaultsService -> createVirtualAccount -> Customer not found for customerId: ${customerId}`)
    }
  }

  // async sendDirectVaultSummary(
  //   customer: CustomerEntity,
  //   liquidationAddress: CreateLiquidationAddressResponseDTO,
  //   bankingInfo: BankingInfoEntity
  // ) {
  //   const { first_name, last_name, email } = customer

  //   const { address, custom_developer_fee_percent } = liquidationAddress

  //   const {
  //     account_owner_name,
  //     bank_name,
  //     account,
  //     account_owner_type,
  //     iban,
  //     first_name: bankFirstName,
  //     last_name: bankLastName,
  //     business_name: bankBusinessName,
  //   } = bankingInfo

  //   await this.emailSenderService.sendDirectVaultSummaryEmail({
  //     creatorFullName: `${first_name} ${last_name}`,
  //     vaultAddress: address,
  //     email,
  //     vaultFeePercentage: Number.parseFloat(custom_developer_fee_percent),
  //     bankInfo: {
  //       accountOwnerName: account_owner_name,
  //       bankName: bank_name,
  //       ...(account
  //         ? {
  //             account: {
  //               routingNumber: account.routing_number,
  //               last4: account.last_4,
  //             },
  //           }
  //         : {
  //             iban: {
  //               // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
  //               last4: iban?.last_4!,
  //               // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
  //               bic: iban?.bic!,
  //               // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
  //               countryCode: iban?.country!,
  //               accountOwnerType: account_owner_type === 'individual' ? 'individual' : 'business',
  //               firstName: bankFirstName,
  //               lastName: bankLastName,
  //               businessName: bankBusinessName,
  //             },
  //           }),
  //     },
  //   })
  // }

  async createLiquidationAddress(
    auth0Id: string,
    { percentage, bridgeExternalAccountId, vaultName }: CreateLiquidationAddressShortDTO
  ): Promise<LiquidationAddressEntity> {
    try {
      this.logger.log(`DirectVaultsService -> createLiquidationAddress, auth0Id:${auth0Id}`)
      const customer = await this.customersService.getCustomerByAuth0Id(auth0Id)

      if (!customer) throw new BadRequestException(MSG.CUSTOMER_NOT_FOUND)

      const bankingInfo = await this.bankingInfoService.getBankingInfoById(auth0Id, bridgeExternalAccountId)

      if (!bankingInfo) {
        throw new BadRequestException(MSG.BANKING_INFO_NOT_FOUND)
      }

      const liquidationAddressInfo: CreateLiquidationAddressDTO = {
        chain: 'base',
        currency: 'usdc',
        external_account_id: bridgeExternalAccountId,
        custom_developer_fee_percent: percentage,
        destination_payment_rail: bankingInfo.iban ? 'sepa' : 'ach',
        destination_currency: bankingInfo.iban ? 'eur' : 'usd',
      }

      this.logger.error(`DirectVaultsService -> createLiquidationAddress -> liquidationAddressInfo`, liquidationAddressInfo)

      const liquidationAddress = await this.bridgeXyzService.createLiquidationAddress(customer.bridgeCustomerId, liquidationAddressInfo)

      if (!liquidationAddress) throw new BadRequestException(MSG.LIQUIDATION_ADDRESS_WRONG_PARAMS)

      const liqAddressEntity = await this.liquidationAddressesService.saveLiquidationAddress(auth0Id, liquidationAddress, vaultName)

      // await this.sendDirectVaultSummary(customer, liquidationAddress, bankingInfo)

      return liqAddressEntity
    } catch (error) {
      this.logger.error(`DirectVaultsService -> createLiquidationAddress -> failure`, error)
      throw error
    }
  }

  async getLiqAddressDrainHistory(auth0Id: string, liqAddressId: string): Promise<GetLiqAddressDrainHistoryResponseDTO> {
    try {
      this.logger.log(`DirectVaultsService -> getLiqAddressDrainHistory, auth0Id:${auth0Id}`)

      const customer = await this.customersService.getCustomerByAuth0Id(auth0Id)

      if (!customer) throw new BadRequestException(MSG.CUSTOMER_NOT_FOUND)

      return await this.bridgeXyzService.getLiqAddressDrainHistory(customer.bridgeCustomerId, liqAddressId)
    } catch (error) {
      this.logger.log(`DirectVaultsService -> getLiqAddressDrainHistory -> failure`, error)
      throw error
    }
  }

  async sendDirectVaultFundsSentEmail(
    drain: Omit<BridgeLiqAddressDrainDTO, 'customer_id' | 'liquidation_address_id'>,
    customer: CustomerEntity,
    liqAddress: LiquidationAddressEntity
  ) {
    const { first_name, last_name, email } = customer
    const { vault_name } = liqAddress
    const { created_at, amount } = drain

    await this.emailSenderService.sendDirectVaultFundsSentEmail({
      fullName: `${first_name} ${last_name}`,
      vaultName: vault_name,
      amount,
      date: dayjs(new Date(created_at)).format('MM/DD/YYYY'),
      email,
    })
  }

  async processBridgeDrainProcessedEvent({ customer_id, liquidation_address_id, ...drainInfo }: BridgeLiqAddressDrainDTO) {
    const customer = await this.customersService.getCustomerByBridgeCustomerId(customer_id)

    if (!customer) {
      return this.logger.log('LiquidationAddressesService -> processBridgeDrainProcessedEvent -> customer not found', customer_id)
    }

    const liquidationAddress = await this.liquidationAddressesService.getLiquidationAddressByIdOnly(liquidation_address_id)

    if (!liquidationAddress) {
      return this.logger.log(
        'LiquidationAddressesService -> processBridgeDrainProcessedEvent -> customer not found',
        liquidation_address_id
      )
    }

    void this.sendDirectVaultFundsSentEmail(drainInfo, customer, liquidationAddress)
  }
}
