import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { v4 as uuid } from 'uuid'
import { ConfigKeys, type IConfig } from '../config/config.interface'
import { HttpService, type HttpModuleOptions } from '@nestjs/axios'
import type {
  BridgeCustomerResponseDto,
  BridgeEventWebhookDTO,
  BridgeLiqAddressDrainDTO,
  CreateCustomerFromKycDTO,
  CreateCustomerFromKycResponseDTO,
  CreateIbanExternalAccountDTO,
  CreateIbanExternalAccountResponseDTO,
  CreateLiquidationAddressDTO,
  CreateLiquidationAddressResponseDTO,
  CreateUsExternalAccountDTO,
  CreateUsExternalAccountResponseDTO,
  GetLiqAddressDrainHistoryBridgeResponseDTO,
  GetLiqAddressDrainHistoryResponseDTO,
  TxHistoryBridgeItem,
  TxHistoryBridgeList,
  TxHistoryList,
  CreateBridgeVirtualAccountDto,
  CreateBridgeVirtualAccountResponseDto,
  GetVirtualAccountActivityBridgeResponseDTO,
  VirtualAccountActivity,
  VirtualAccountActivityItem,
} from './bridge-xyz.dto'
import { lastValueFrom } from 'rxjs'
import { LazyModuleLoader } from '@nestjs/core'
import { SecretsManagerService } from '../secrets-manager/secrets-manager.service'
import { DrainState, VirtualAddressActivityType } from './bridge-xyz.types'
import crypto from 'node:crypto'
import { DirectVaultsService } from '../direct-vaults/direct-vaults.service'
import type { RawBodyRequest } from '../utils/helpers'
import { VirtualAccountsService } from '../virtual-accounts/virtual-accounts.service'
import type { InternalAxiosRequestConfig } from 'axios'

@Injectable()
export class BridgeXyzService {
  private readonly logger = new Logger(BridgeXyzService.name)
  private apiKey!: string
  private baseUrl: string

  public constructor(
    private readonly httpService: HttpService,
    private lazyModuleLoader: LazyModuleLoader,
    @Inject(ConfigService) private readonly configService: ConfigService<IConfig, true>,
    @Inject(forwardRef(() => DirectVaultsService))
    private readonly directVaultService: DirectVaultsService,
    @Inject(forwardRef(() => VirtualAccountsService))
    private readonly virtualAccountsService: VirtualAccountsService
  ) {
    this.baseUrl = this.configService.get<string>(ConfigKeys.BRIDGE_URL)

    /* 👇 interceptor */
    this.httpService.axiosRef.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const apiKey = (config.headers?.['Api-Key'] ?? config.headers?.['api-key']) as string | undefined

        const redactedKey = apiKey ? `${apiKey.slice(0, 6)}…` : 'none'

        this.logger.debug(`[Bridge] → ${config.method?.toUpperCase()} ${config.baseURL}${config.url}  (Api-Key: ${redactedKey})`)

        return config
      },
      (error) => {
        // optional: see the error before Axios retries/throws
        this.logger.error('[Bridge] request-config error', error)
        return Promise.reject(error)
      }
    )
  }

  async getApiKey(): Promise<string> {
    if (this.apiKey) return this.apiKey
    try {
      const { SecretsManagerModule } = await import('../secrets-manager/secrets-manager.module')
      const moduleRef = await this.lazyModuleLoader.load(() => SecretsManagerModule, { logger: true })
      const secretsManagerService = moduleRef.get(SecretsManagerService)

      const key = secretsManagerService.getBridgeApiKey()
      this.apiKey = key
      return this.apiKey
    } catch (error) {
      this.logger.error('BridgeXyzService -> getApiKey error', error)
      throw error
    }
  }

  private apiCall(config: HttpModuleOptions) {
    return lastValueFrom(this.httpService.request(config)).then((response) => response?.data)
  }

  async createCustomerWithKYC(customerInfo: CreateCustomerFromKycDTO): Promise<CreateCustomerFromKycResponseDTO> {
    await this.getApiKey()
    const config = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Api-Key': this.apiKey,
        'Idempotency-Key': uuid(),
      },
      url: `/v0/kyc_links`,
      baseURL: this.baseUrl,
      data: {
        ...customerInfo,
        developer_accepted_tos: true, // Always true for TOS reliance
      },
    }

    return await this.apiCall(config).catch((error) => {
      if (error?.response?.data.existing_kyc_link) {
        this.logger.log(`BridgeXyzService -> createCustomerWithKYC -> KYC link for such user already created`)
        return error?.response?.data.existing_kyc_link
      }
      this.logger.error(`BridgeXyzService -> createCustomerWithKYC -> failure`, error?.response?.data)
      throw error
    })
  }

  async checkKycStatus(kycLinkId: string): Promise<CreateCustomerFromKycResponseDTO> {
    await this.getApiKey()
    const config = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Api-Key': this.apiKey,
      },
      url: `/v0/kyc_links/${kycLinkId}`,
      baseURL: this.baseUrl,
    }

    try {
      return await this.apiCall(config)
    } catch (error) {
      this.logger.error(`BridgeXyzService -> checkKycStatus -> failure`, error?.response?.data)
      throw error
    }
  }

  async getCustomerById(customerId: string): Promise<BridgeCustomerResponseDto> {
    await this.getApiKey()
    const config = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Api-Key': this.apiKey,
      },
      url: `/v0/customers/${customerId}`,
      baseURL: this.baseUrl,
    }

    try {
      return await this.apiCall(config)
    } catch (error) {
      this.logger.error(`BridgeXyzService -> getCustomerById -> failure`, error?.response?.data)
      throw error
    }
  }

  async updateCustomerById(customerId: string, signedAgreementId: string) {
    await this.getApiKey()
    const config = {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Api-Key': this.apiKey,
      },
      url: `/v0/customers/${customerId}`,
      baseURL: this.baseUrl,
      data: {
        has_accepted_terms_of_service: true,
        signed_agreement_id: signedAgreementId,
      },
    }

    return await this.apiCall(config).catch((error) => {
      this.logger.error(`BridgeXyzService -> updateCustomerById -> failure`, error?.response?.data)
      throw error
    })
  }

  async getExternalAccountById(
    customerId: string,
    externalAccountId: string
  ): Promise<CreateUsExternalAccountResponseDTO | CreateIbanExternalAccountResponseDTO> {
    await this.getApiKey()
    const config = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Api-Key': this.apiKey,
      },
      url: `/v0/customers/${customerId}/external_accounts/${externalAccountId}`,
      baseURL: this.baseUrl,
    }

    try {
      return await this.apiCall(config)
    } catch (error) {
      this.logger.error(`BridgeXyzService -> getExternalAccountById -> failure`, error?.response?.data)
      throw error
    }
  }

  async createExternalAccount(
    customerId: string,
    externalAccountInfo: CreateUsExternalAccountDTO | CreateIbanExternalAccountDTO
  ): Promise<CreateUsExternalAccountResponseDTO | CreateIbanExternalAccountResponseDTO> {
    await this.getApiKey()
    const config = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Api-Key': this.apiKey,
        'Idempotency-Key': uuid(),
      },
      data: externalAccountInfo,
      url: `/v0/customers/${customerId}/external_accounts`,
      baseURL: this.baseUrl,
    }

    try {
      return await this.apiCall(config)
    } catch (error) {
      if (error.response.status === 400 && error?.response?.data.code === 'duplicate_external_account') {
        this.logger.log(`BridgeXyzService -> createExternalAccount -> already created, getting by id`)
        return await this.getExternalAccountById(customerId, error?.response?.data.id)
      }

      this.logger.error(`BridgeXyzService -> createExternalAccount -> failure`, error?.response?.data)
      throw error
    }
  }

  async getExternalAccount(
    customerId: string,
    externalAccountId: string
  ): Promise<CreateUsExternalAccountResponseDTO | CreateIbanExternalAccountResponseDTO> {
    await this.getApiKey()
    const config = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Api-Key': this.apiKey,
      },
      url: `/v0/customers/${customerId}/external_accounts/${externalAccountId}`,
      baseURL: this.baseUrl,
    }

    try {
      return await this.apiCall(config)
    } catch (error) {
      this.logger.error(`BridgeXyzService -> getExternalAccount -> failure`, error?.response?.data)
      throw error
    }
  }

  async getCustomerExternalAccounts(
    customerId: string
  ): Promise<(CreateUsExternalAccountResponseDTO | CreateIbanExternalAccountResponseDTO)[]> {
    await this.getApiKey()
    const config = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Api-Key': this.apiKey,
      },
      url: `/v0/customers/${customerId}/external_accounts/`,
      baseURL: this.baseUrl,
    }

    try {
      return await this.apiCall(config)
    } catch (error) {
      this.logger.error(`BridgeXyzService -> getCustomerExternalAccounts -> failure`, error?.response?.data)
      throw error
    }
  }

  async getLiquidationAddressById(customerId: string, liquidationAddressId: string): Promise<CreateLiquidationAddressResponseDTO> {
    await this.getApiKey()
    const config = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Api-Key': this.apiKey,
      },
      url: `/v0/customers/${customerId}/liquidation_addresses/${liquidationAddressId}`,
      baseURL: this.baseUrl,
    }

    try {
      return await this.apiCall(config)
    } catch (error) {
      this.logger.error(`BridgeXyzService -> getLiquidationAddressById -> failure`, error?.response?.data)
      throw error
    }
  }

  async createLiquidationAddress(
    customerId: string,
    liquidationAddress: CreateLiquidationAddressDTO
  ): Promise<CreateLiquidationAddressResponseDTO> {
    await this.getApiKey()
    const config = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Api-Key': this.apiKey,
        'Idempotency-Key': uuid(),
      },
      url: `/v0/customers/${customerId}/liquidation_addresses`,
      baseURL: this.baseUrl,
      data: liquidationAddress,
    }

    return await this.apiCall(config).catch((error) => {
      if (error.response.status === 400 && error?.response?.data.code === 'invalid_parameters' && error?.response?.data.id) {
        this.logger.log(`BridgeXyzService -> createLiquidationAddress -> already created, getting by id`)
        return this.getLiquidationAddressById(customerId, error?.response?.data.id)
      }
      this.logger.error(`BridgeXyzService -> createLiquidationAddress -> failure`, error?.response?.data || error.message)
      throw error
    })
  }

  private transformTransactions(transactions: TxHistoryBridgeList): TxHistoryList {
    const groupedByDate: Record<string, number> = {}

    transactions.forEach((transaction) => {
      const dateObj = new Date(transaction.created_at)

      if (Number.isNaN(dateObj.getTime())) {
        console.warn(`Invalid date format: ${transaction.created_at}`)
        return
      }

      const formattedDate = `${dateObj.getFullYear()}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getDate().toString().padStart(2, '0')}`

      const amount = Number.parseFloat(transaction.amount)

      if (groupedByDate[formattedDate]) {
        groupedByDate[formattedDate] += amount
      } else {
        groupedByDate[formattedDate] = amount
      }
    })

    const result: TxHistoryList = Object.keys(groupedByDate).map((date) => ({
      amount: groupedByDate[date],
      date,
    }))

    return result
  }

  private async getLiqAddressDrainHistoryPaginated(
    customerId: string,
    liqAddressId: string,
    {
      limit,
      startingAfterId,
      endingBeforeId,
    }: {
      limit?: number
      startingAfterId?: string
      endingBeforeId?: string
    } = {}
  ): Promise<TxHistoryBridgeList> {
    await this.getApiKey()
    try {
      const queryParams = new URLSearchParams()

      if (limit) {
        queryParams.append('limit', limit.toString())
      }

      if (startingAfterId) {
        queryParams.append('starting_after', startingAfterId)
      }

      if (endingBeforeId) {
        queryParams.append('ending_before', endingBeforeId)
      }

      const queryParamsString = queryParams.toString()

      const config = {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Api-Key': this.apiKey,
        },
        url: `/v0/customers/${encodeURIComponent(customerId)}/liquidation_addresses/${encodeURIComponent(liqAddressId)}/drains${
          queryParamsString ? `?${queryParamsString}` : ''
        }`,
        baseURL: this.baseUrl,
      }

      return ((await this.apiCall(config)) as GetLiqAddressDrainHistoryBridgeResponseDTO).data
    } catch (error) {
      this.logger.error(`BridgeXyzService -> getLiqAddressDrainHistoryPaginated -> failure`, error?.response?.data)
      throw error
    }
  }

  async getLiqAddressDrainHistory(customerId: string, liqAddressId: string): Promise<GetLiqAddressDrainHistoryResponseDTO> {
    await this.getApiKey()
    try {
      let endingBeforeId: string | undefined

      const txFullHistoryList: TxHistoryBridgeItem[] = []

      // Loading full list in multiple requests while requested list is not empty
      // eslint-disable-next-line no-constant-condition
      while (true) {
        // eslint-disable-next-line no-await-in-loop
        const list = await this.getLiqAddressDrainHistoryPaginated(customerId, liqAddressId, { endingBeforeId })

        const lastItem = list.at(-1)

        if (!lastItem) {
          break
        }

        endingBeforeId = lastItem.id

        txFullHistoryList.push(...list)
      }

      const txHistoryByDay = this.transformTransactions(txFullHistoryList)
      // eslint-disable-next-line id-denylist, unicorn/prevent-abbreviations
      const totalTransferred = txHistoryByDay.reduce((accumulator, e) => accumulator + e.amount, 0)

      return {
        list: txHistoryByDay,
        totalTransferred,
      }
    } catch (error) {
      this.logger.error(`BridgeXyzService -> getLiqAddressDrainHistory -> failure`, error?.response?.data)
      throw error
    }
  }
  private verifySignature(timestamp: string, body: string, signature: string, publicKey: string) {
    const hash = crypto.createHash('SHA256')
    hash.update(`${timestamp}.${body}`)

    const verifier = crypto.createVerify('SHA256')
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    verifier.update(hash.digest())
    verifier.end()

    const buffer = Buffer.from(signature, 'base64')
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return verifier.verify(publicKey, buffer)
  }

  verifyBridgeEventSignature(request: RawBodyRequest): boolean {
    if (!request.rawBody) {
      return false
    }
    const publicKey = this.configService.get(ConfigKeys.BRIDGE_WEBHOOK_PUBLIC_KEY, { infer: true })
    if (!publicKey) {
      return false
    }
    const signatureHeader = request.headers['x-webhook-signature']
    if (!signatureHeader || typeof signatureHeader !== 'string') {
      return false
    }
    const [, timestamp, signature] = signatureHeader.match(/^t=(\d+),v0=(.*)$/) || []
    if (!timestamp || !signature) {
      return false
    }
    if (new Date(Number.parseInt(timestamp, 10)) < new Date(Date.now() - 10 * 60 * 1000)) {
      return false
    }

    return this.verifySignature(timestamp, request.rawBody, signature, publicKey)
  }

  async processBridgeEvent(bridgeEventWebhookDTO: BridgeEventWebhookDTO): Promise<void> {
    if (bridgeEventWebhookDTO.event_category === 'liquidation_address.drain') {
      this.logger.log(
        'LiquidationAddressesService -> processBridgeEvent -> bridgeEventWebhookDTO. Liq address drain event caught.',
        bridgeEventWebhookDTO
      )
      const eventObject = bridgeEventWebhookDTO.event_object as BridgeLiqAddressDrainDTO
      if (eventObject.state === DrainState.PAYMENT_PROCESSED) {
        await this.directVaultService.processBridgeDrainProcessedEvent(eventObject)
      }
    }

    if (bridgeEventWebhookDTO.event_category === 'virtual_account.activity') {
      this.logger.log(
        'LiquidationAddressesService -> processBridgeEvent -> bridgeEventWebhookDTO. Virtual account activity event caught.',
        bridgeEventWebhookDTO
      )

      const eventObject = bridgeEventWebhookDTO.event_object as VirtualAccountActivityItem

      if (eventObject.type === VirtualAddressActivityType.PAYMENT_PROCESSED) {
        await this.virtualAccountsService.processVirtualAccountPaymentProcessedEvent(eventObject)
      }
    }
  }

  async getVirtualAccountById(
    customerId: string,
    virtualAccount: string
  ): Promise<Omit<CreateBridgeVirtualAccountResponseDto, 'customer_id'>> {
    await this.getApiKey()
    const config = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Api-Key': this.apiKey,
      },
      url: `/v0/customers/${customerId}/virtual_accounts/${virtualAccount}`,
      baseURL: this.baseUrl,
    }

    try {
      return await this.apiCall(config)
    } catch (error) {
      this.logger.error(`BridgeXyzService -> getVirtualAccountById -> failure`, error?.response?.data)
      throw error
    }
  }

  async getVirtualAccountsByCustomerId(customerId: string): Promise<Omit<CreateBridgeVirtualAccountResponseDto, 'customer_id'>[]> {
    await this.getApiKey()
    const config = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Api-Key': this.apiKey,
      },
      url: `/v0/customers/${customerId}/virtual_accounts/`,
      baseURL: this.baseUrl,
    }

    try {
      const resp = await this.apiCall(config)
      return resp
    } catch (error) {
      this.logger.error(`BridgeXyzService -> getVirtualAccountById -> failure`, error?.response?.data)
      throw error
    }
  }

  async createVirtualAccount(
    customerId: string,
    virtualAccountData: CreateBridgeVirtualAccountDto
  ): Promise<CreateBridgeVirtualAccountResponseDto> {
    await this.getApiKey()
    console.log(virtualAccountData)
    const config = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Api-Key': this.apiKey,
        'Idempotency-Key': uuid(),
      },
      data: virtualAccountData,
      url: `/v0/customers/${customerId}/virtual_accounts`,
      baseURL: this.baseUrl,
    }

    try {
      return await this.apiCall(config)
    } catch (error) {
      if (error.response.status === 400 && error?.response?.data.code === 'duplicate_external_account') {
        this.logger.log(`BridgeXyzService -> createVirtualAccount -> already created, getting by id`)
        const virtualAccount = await this.getVirtualAccountById(customerId, error?.response?.data.id)
        return {
          customer_id: customerId,
          ...virtualAccount,
        }
      }

      this.logger.error(`BridgeXyzService -> createExternalAccount -> failure`, error?.response?.data)
      throw error
    }
  }

  async getVirtualAccountActivityPaginated(
    customerId: string,
    virtualAccountId: string,
    {
      limit,
      startingAfterId,
      endingBeforeId,
      event_type,
    }: {
      limit?: number
      startingAfterId?: string
      endingBeforeId?: string
      event_type?: string
    } = {}
  ): Promise<VirtualAccountActivity> {
    await this.getApiKey()
    try {
      this.logger.log(`BridgeXyzService -> getVirtualAccountActivityPaginated -> data`, {
        customerId,
        virtualAccountId,
        limit,
        startingAfterId,
        endingBeforeId,
        event_type,
      })

      const queryParams = new URLSearchParams()

      if (limit) queryParams.append('limit', limit.toString())
      if (startingAfterId) queryParams.append('starting_after', startingAfterId)
      if (endingBeforeId) queryParams.append('ending_before', endingBeforeId)
      if (event_type) queryParams.append('event_type', event_type)

      const config = {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Api-Key': this.apiKey,
        },
        url: `/v0/customers/${customerId}/virtual_accounts/${virtualAccountId}/history`,
        baseURL: this.baseUrl,
        queryParams,
      }

      return ((await this.apiCall(config)) as GetVirtualAccountActivityBridgeResponseDTO).data
    } catch (error) {
      this.logger.error(`BridgeXyzService -> getVirtualAccountActivityPaginated -> failure`, error?.response?.data || error.message)
      throw error
    }
  }

  async getVirtualAccountActivity(
    customerId: string,
    virtualAccountId: string,
    params: { event_type?: string } = {}
  ): Promise<VirtualAccountActivity> {
    await this.getApiKey()
    try {
      let endingBeforeId: string | undefined

      const activity = []

      // Loading full list in multiple requests while requested list is not empty
      // eslint-disable-next-line no-constant-condition
      while (true) {
        // eslint-disable-next-line no-await-in-loop
        const list = await this.getVirtualAccountActivityPaginated(customerId, virtualAccountId, { endingBeforeId, ...params })

        const lastItem = list.at(-1)

        if (!lastItem) {
          break
        }

        endingBeforeId = lastItem.id

        activity.push(...list)
      }

      return activity
    } catch (error) {
      this.logger.error(`BridgeXyzService -> getVirtualAccountActivity -> failure`, error?.response?.data || error.message)
      throw error
    }
  }
}
