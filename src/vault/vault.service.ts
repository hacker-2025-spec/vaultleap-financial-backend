import { Client } from 'urql'

import {
  TestTokenUSDC__factory,
  FundsDistributor__factory,
  ShareHolderVault__factory,
  ShareRolesManager__factory,
} from '@KLYDO-io/getrewards-contracts'
import { DataMapper } from '@nova-odm/mapper'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { Deployments } from '@KLYDO-io/getrewards-contracts/deployments'

import type { UsersEntity } from '../users/users.entity'
import { EthRpcService } from '../eth-rpc/eth-rpc.service'
import { TRANSACTION_STATUS } from '../evm-transaction-sender/evm-transaction-sender.types'
import { createRecord, getAllRecords, getRecord, queryRecords } from '../utils/dynamoDbHelpers'

import { VaultEntity } from './vault.entity'
import { VaultUserRole } from './vault.types'
import type { OwnershipType } from './vault.types'
import { VaultDto, VaultInfoDto, VaultTransactionStatusDTO, SelfManagedVaultTransactionStatusDTO } from './vault.dto'
import type { TShareRoleDto, VaultCreationDto, VaultKeysDto } from './vault.dto'
import { ShareholdersClaimAccountsService } from '../shareholders-claim-accounts/shareholders-claim-accounts.service'
import { ethers } from 'ethers'
import { SumSubService } from '../sum-sub/sum-sub.service'
import { ShareHoldersClaimAccountsEntity } from '../shareholders-claim-accounts/shareholders-claim-accounts.entity'
import { decrypt } from '../utils/crypto'
import { PersonaService } from '../persona/persona.service'
import { AddressActivityService } from '../address-activity/address-activity.service'

@Injectable()
export class VaultService {
  private readonly logger = new Logger(VaultService.name)
  public constructor(
    @Inject(DataMapper) protected dataMapper: DataMapper,
    @Inject(EthRpcService) protected ethRpcService: EthRpcService,
    @Inject('Deployments') private deployments: Deployments,
    @Inject(SumSubService) private sumSubService: SumSubService,
    @Inject(PersonaService) private personaService: PersonaService,
    protected graphClient: Client,
    private shareholdersClaimAccountService: ShareholdersClaimAccountsService,
    private readonly addressActivityService: AddressActivityService
  ) {}

  private async getAllVaultsAddresses() {
    try {
      const records = getAllRecords(this.dataMapper, VaultEntity)
      const addresses = []

      for await (const record of records) {
        if (record.vaultAddress) {
          addresses.push(record.vaultAddress.trim() as string)
        }
      }
      return addresses
    } catch (error) {
      console.log('fetching lall issue', error)
      throw new Error(error)
    }
  }

  async getAllTaxFormEnabledVaults(): Promise<VaultEntity[]> {
    try {
      const vaultRecords = this.dataMapper.scan(VaultEntity, { filter: { subject: 'taxFormEnabled', type: 'Equals', object: true } })
      const vaultList = []
      for await (const record of vaultRecords) {
        vaultList.push(record)
      }
      this.logger.log('VaultService => getAllTaxFormEnabledVaults => vaultList', JSON.stringify(vaultList))
      return vaultList
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new Error(error)
    }
  }

  async getLatestVaultByOwnerUserId(userId: string): Promise<VaultDto | undefined> {
    try {
      this.logger.log('VaultService => getLatestVaultByOwnerUserId => userId', userId)
      const vaultRecords = await queryRecords(this.dataMapper, { userId }, { indexName: 'userIdIndex' }, VaultEntity)
      const sortedVaults = vaultRecords.filter((record) => record.createdAt).sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
      this.logger.log('VaultService => getLatestVaultByOwnerUserId => sortedVaults', JSON.stringify(sortedVaults))
      const result = sortedVaults[0]
      this.logger.log('VaultService => getLatestVaultByOwnerUserId => result', JSON.stringify(result))
      if (result) {
        return Object.assign(new VaultDto(), result)
      }
      // eslint-disable-next-line no-undefined
      return undefined
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new Error(error)
    }
  }

  async getUnwatchedManagedVaultsByUserId(userId: string): Promise<VaultDto[]> {
    try {
      this.logger.log('VaultService => getUnwatchedManagedVaultsByUserId => userId', userId)
      const vaultRecords = await queryRecords(this.dataMapper, { userId }, { indexName: 'userIdIndex' }, VaultEntity)
      const vaultList = []
      for await (const record of vaultRecords) {
        if (!record.watching && record.transactionStatus === TRANSACTION_STATUS.SUCCESSFUL) {
          vaultList.push(Object.assign(new VaultDto(), record))
        }
      }
      this.logger.log('VaultService => getUnwatchedManagedVaultsByUserId => vaultList', JSON.stringify(vaultList))
      return vaultList
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new Error(error)
    }
  }

  async getManagedVaults(userId: string): Promise<VaultDto[]> {
    try {
      this.logger.log('VaultService => getManagedVaults => userId', userId)
      const vaultRecords = await queryRecords(this.dataMapper, { userId }, { indexName: 'userIdIndex' }, VaultEntity)
      const vaultList = []
      for await (const record of vaultRecords) {
        if (
          // eslint-disable-next-line no-undefined
          (record.watching || record.watching === undefined) &&
          record.transactionStatus === TRANSACTION_STATUS.SUCCESSFUL
        ) {
          vaultList.push(Object.assign(new VaultDto(), record))
        }
      }
      this.logger.log('VaultService => getManagedVaults => vaultList', JSON.stringify(vaultList))
      return vaultList
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new Error(error)
    }
  }

  async getUnwatchedContractorVaultsByEmail(email: string): Promise<VaultDto[]> {
    try {
      this.logger.log('VaultService => getUnwatchedContractorVaultsByEmail => email', email)
      const vaultRecords = getAllRecords(this.dataMapper, VaultEntity)
      const vaultList = []
      for await (const record of vaultRecords) {
        const roleIndex = record.roles.findIndex((role) => role.emails.includes(email))
        if (roleIndex >= 0 && !record.roles[roleIndex].watching && record.transactionStatus === TRANSACTION_STATUS.SUCCESSFUL) {
          vaultList.push(Object.assign(new VaultDto(), record))
        }
      }
      this.logger.log('VaultService => getUnwatchedContractorVaultsByEmail => vaultList', JSON.stringify(vaultList))
      return vaultList
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new Error(error)
    }
  }

  async getMyContractorVaults(email: string): Promise<VaultDto[]> {
    try {
      this.logger.log('VaultService => getMyContractorVaults => email', email)
      const vaultRecords = getAllRecords(this.dataMapper, VaultEntity)
      const vaultList = []
      for await (const record of vaultRecords) {
        // eslint-disable-next-line no-undefined
        const roles = record.roles.filter((role) => role.emails.includes(email) && (role.watching || role.watching === undefined))
        if (roles.length > 0 && record.transactionStatus === TRANSACTION_STATUS.SUCCESSFUL) {
          for await (const [index] of roles.entries()) {
            const vault = Object.assign(new VaultDto(), record)

            const { tokenId, claimable, tokenAddress, walletAddress, alreadyClaimed } = await this.getVaultRoleInfo(vault, index)

            vault.alreadyClaimed = alreadyClaimed
            vault.tokenAddress = tokenAddress
            vault.tokenId = tokenId
            vault.walletAddress = walletAddress
            vault.claimable = claimable

            vaultList.push(Object.assign(new VaultDto(), vault))
          }
        }
      }
      this.logger.log('VaultService => getMyContractorVaults => vaultList', JSON.stringify(vaultList))
      return vaultList
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new Error(error)
    }
  }

  async getAllUserVaults(user: UsersEntity, role?: VaultUserRole): Promise<VaultDto[]> {
    this.logger.log('VaultService => getAllUserVaults => role', role)
    this.logger.log('VaultService => getAllUserVaults => userId', user.auth0Id)
    switch (role) {
      case VaultUserRole.MANAGER: {
        return this.getManagedVaults(user.auth0Id)
      }
      case VaultUserRole.CONTRACTOR: {
        return this.getMyContractorVaults(user.email)
      }
      default: {
        const vaultsAsContractor = await this.getMyContractorVaults(user.email)
        const vaultsAsManager = await this.getManagedVaults(user.auth0Id)
        return [...vaultsAsManager, ...vaultsAsContractor]
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-shadow
  async getVaultById(id: string): Promise<VaultDto> {
    try {
      this.logger.log('VaultService => getVaultById => id', id)
      const vaultRecord = await getRecord(this.dataMapper, id, VaultEntity)
      this.logger.log('VaultService => getVaultById => vaultRecord', JSON.stringify(vaultRecord))
      return Object.assign(new VaultDto(), vaultRecord)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new Error(error)
    }
  }

  async getVaultInfoById(user: UsersEntity, id: string, role: VaultUserRole, tokenId?: string): Promise<VaultInfoDto> {
    try {
      this.logger.log('VaultService => getVaultInfoById => id', id)
      this.logger.log('VaultService => getVaultInfoById => role', role)
      this.logger.log('VaultService => getVaultInfoById => tokenId', tokenId)
      this.logger.log('VaultService => getVaultInfoById => userId', user.auth0Id)
      const vaultRecord = await getRecord(this.dataMapper, id, VaultEntity)
      const databaseRecord = Object.assign(new VaultInfoDto(), vaultRecord)

      if (!databaseRecord.vaultAddress) {
        throw new Error('Vault Address not found')
      }

      const totalPaid = await this.getVaultTotalEarnedFunds(databaseRecord.vaultAddress)

      this.logger.log('VaultService => getVaultInfoById => totalPaid', totalPaid)
      databaseRecord.totalPaid = totalPaid

      if (role === VaultUserRole.MANAGER) {
        const tokenContract = new TestTokenUSDC__factory().connect(await this.ethRpcService.getRpcProvider())
        const currentFunds = await tokenContract
          .attach(this.deployments.USDC)
          .getFunction('balanceOf')
          .staticCall(databaseRecord.shareholderManagerAddress)
          .then((value) => value.toString())
          .catch(() => 0)

        databaseRecord.currentFunds = currentFunds
        this.logger.log('VaultService => getVaultInfoById => currentFunds', currentFunds)
      } else if (role === VaultUserRole.CONTRACTOR) {
        const roleIndex = tokenId ? Number(tokenId) : vaultRecord.roles.findIndex((vRole) => vRole.emails.includes(user.email))

        const { claimable, totalIncome, tokenAddress, walletAddress } = await this.getVaultRoleInfo(vaultRecord, roleIndex, totalPaid)

        databaseRecord.roles[roleIndex].totalIncome = totalIncome
        databaseRecord.tokenAddress = tokenAddress
        databaseRecord.tokenId = tokenId
        databaseRecord.walletAddress = walletAddress
        databaseRecord.claimable = claimable
      }

      databaseRecord.vaultFundsStatistics = await this.getVaultFundsStatistics(databaseRecord.vaultAddress)

      this.logger.log('VaultService => getVaultInfoById => record', JSON.stringify(Object.assign(new VaultInfoDto(), databaseRecord)))
      return Object.assign(new VaultInfoDto(), databaseRecord)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new Error(error)
    }
  }

  async createVault(vaultConfig: VaultCreationDto): Promise<VaultDto> {
    try {
      this.logger.log('VaultService => createVault => vaultConfig', JSON.stringify(vaultConfig))
      if (!vaultConfig.agreeToTOSAndPP) {
        throw new Error('Needs to agree to TOS and PP')
      }

      const foundMatching = vaultConfig.roles.filter((currentRole, currentIndex) => {
        const foundMatchingIndex = vaultConfig.roles.findIndex(
          (role, index) => role.emails[0] === currentRole.emails[0] && currentIndex !== index
        )
        return foundMatchingIndex > -1
      })

      if (foundMatching.length > 0) {
        throw new Error('Emails must be unique')
      }
      const vaultRecord = await createRecord(
        this.dataMapper,
        {
          ...vaultConfig,
          watching: true,
          roles: vaultConfig.roles.map((role) => ({ ...role, watching: true })),
        },
        VaultEntity
      )

      this.logger.log('VaultService => createVault => vaultRecord', JSON.stringify(vaultRecord))

      this.createVaultAdressesWebhook()
      return Object.assign(new VaultDto(), vaultRecord)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new Error(error)
    }
  }

  async createSelfManagedVault(vaultConfig: VaultCreationDto) {
    if (!vaultConfig.agreeToTOSAndPP) {
      throw new Error('Needs to agree to TOS and PP')
    }

    try {
      this.logger.log('VaultService => createSelfManagedVault => vaultConfig', JSON.stringify(vaultConfig))

      const roles = [
        {
          ...vaultConfig.roles[0],
          count: 1,
          emails: [vaultConfig.ownerEmail],
          name: 'Self-managed',
          sharePercentage: 100,
          shareHolderRoleAddress: '',
          watching: true,
        },
      ]

      const vaultRecord = await createRecord(
        this.dataMapper,
        {
          ...vaultConfig,
          watching: true,
          roles,
          selfManaged: true,
        },
        VaultEntity
      )

      this.logger.log('VaultService => createSelfManagedVault => vaultRecord', JSON.stringify(vaultRecord))

      this.createVaultAdressesWebhook()

      return Object.assign(new VaultDto(), vaultRecord)
    } catch (error) {
      throw new Error(error)
    }
  }

  async updateRoleEmail(id: string, tokenAddress: string, email: string): Promise<VaultDto> {
    try {
      this.logger.log('VaultService => updateRoleEmail => id', id)
      this.logger.log('VaultService => updateRoleEmail => tokenAddress', tokenAddress)
      this.logger.log('VaultService => updateRoleEmail => email', email)

      const vault = await this.getVaultById(id)
      const selectedRoleIndex = vault.roles.findIndex((role) => role.shareHolderRoleAddress === tokenAddress)
      this.logger.log('VaultService => updateRoleEmail => selectedRoleIndex', selectedRoleIndex)

      if (selectedRoleIndex < 0) {
        throw new Error('Role not found')
      }

      const selectedRole = vault.roles[selectedRoleIndex]
      const roles: TShareRoleDto[] = []

      for (const [index, role] of vault.roles.entries()) {
        if (index === selectedRoleIndex) roles.push({ ...selectedRole, emails: [email] })
        else roles.push(role)
      }

      const vaultRecord = await this.dataMapper.update(
        Object.assign(new VaultEntity(), {
          ...vault,
          roles,
        })
      )
      this.logger.log('VaultService => updateRoleEmail => vaultRecord', vaultRecord)
      return Object.assign(new VaultDto(), vaultRecord)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new Error(error)
    }
  }

  async finishSelfManagedVaultClaim(vaultId: string, tokenAddress: string) {
    try {
      this.logger.log('VaultService => finishSelfManagedVaultClaim => vaultId', vaultId)
      this.logger.log('VaultService => finishSelfManagedVaultClaim => tokenAddress', tokenAddress)

      const vault = await this.getVaultById(vaultId)

      await this.shareholdersClaimAccountService.removeShareholderClaimAccountInfoByAddress(tokenAddress, vaultId)

      return vault
    } catch (error) {
      throw new Error(error)
    }
  }

  async unwatchVault(user: UsersEntity, id: string, role: VaultUserRole): Promise<VaultDto> {
    try {
      this.logger.log('VaultService => unwatchVault => id', id)
      this.logger.log('VaultService => unwatchVault => role', role)
      this.logger.log('VaultService => unwatchVault => userId', user.auth0Id)
      const databaseRecord = await getRecord(this.dataMapper, id, VaultEntity)

      if (role === VaultUserRole.MANAGER) {
        if (databaseRecord.userId === user.auth0Id) databaseRecord.watching = false
      } else if (role === VaultUserRole.CONTRACTOR) {
        const roleIndex = databaseRecord.roles.findIndex((dRole) => dRole.emails.includes(user.email))
        databaseRecord.roles[roleIndex].watching = false
      }

      const vaultRecord = await this.dataMapper.update(Object.assign(new VaultEntity(), databaseRecord))
      this.logger.log('VaultService => unwatchVault => vaultRecord', JSON.stringify(vaultRecord))
      return Object.assign(new VaultDto(), vaultRecord)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new Error(error)
    }
  }

  async watchAllVaults(user: UsersEntity): Promise<VaultDto[]> {
    try {
      const databaseRecords = []
      const databaseManagerRecords = await this.getUnwatchedManagedVaultsByUserId(user.auth0Id)
      if (databaseManagerRecords.length > 0) {
        for await (const vault of databaseManagerRecords) {
          const vaultRecord = await this.dataMapper.update(
            Object.assign(new VaultEntity(), {
              ...vault,
              watching: true,
            })
          )
          databaseRecords.push(Object.assign(new VaultDto(), vaultRecord))
        }
      }

      const databaseContractorRecords = await this.getUnwatchedContractorVaultsByEmail(user.email)
      if (databaseContractorRecords.length > 0) {
        for await (const vault of databaseContractorRecords) {
          const roleIndex = vault.roles.findIndex((dRole) => dRole.emails.includes(user.email))
          const updatedRecord = { ...vault }
          updatedRecord.roles[roleIndex].watching = true
          const vaultRecord = await this.dataMapper.update(Object.assign(new VaultEntity(), updatedRecord))
          databaseRecords.push(Object.assign(new VaultDto(), vaultRecord))
        }
      }

      return databaseRecords
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new Error(error)
    }
  }

  async markTaxInfoProvidedToVault(id: string, tokenAddress?: string): Promise<VaultDto> {
    try {
      this.logger.log('VaultService => markTaxInfoProvidedToVault => id', id)
      this.logger.log('VaultService => markTaxInfoProvidedToVault => tokenAddress', tokenAddress)
      const databaseRecord = await getRecord(this.dataMapper, id, VaultEntity)

      if (tokenAddress) {
        databaseRecord.roles[databaseRecord.roles.findIndex((role) => role.shareHolderRoleAddress === tokenAddress)].taxInfoProvided = true
      }

      const vaultRecord = await this.dataMapper.update(Object.assign(new VaultEntity(), databaseRecord))
      this.logger.log('VaultService => markTaxInfoProvidedToVault => vaultRecord', JSON.stringify(vaultRecord))
      return Object.assign(new VaultDto(), vaultRecord)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new Error(error)
    }
  }

  async getTransactionStatus(vaultId: string): Promise<VaultTransactionStatusDTO> {
    this.logger.log('VaultService => getTransactionStatus => vaultId', vaultId)
    const databaseRecord = await getRecord(this.dataMapper, vaultId, VaultEntity)
    this.logger.log('VaultService => getTransactionStatus => databaseRecord', JSON.stringify(databaseRecord))
    return Object.assign(new VaultTransactionStatusDTO(), { status: databaseRecord.transactionStatus })
  }

  async getSelfManagedVaultTransactionStatus(vaultId: string): Promise<SelfManagedVaultTransactionStatusDTO> {
    try {
      this.logger.log('VaultService => getSelfManagedVaultTransactionStatus => vaultId', vaultId)
      const databaseRecord = await getRecord(this.dataMapper, vaultId, VaultEntity)
      this.logger.log('VaultService => getSelfManagedVaultTransactionStatus => databaseRecord', JSON.stringify(databaseRecord))

      if (!databaseRecord.selfManaged) {
        throw new Error('Vault is not self-managed')
      }

      const info = await this.shareholdersClaimAccountService.getInfoForShareholderClaimAccount(databaseRecord.ownerEmail, vaultId)

      if (!info) {
        throw new Error('No shareholder account for specified self-managed vault')
      }

      return Object.assign(new SelfManagedVaultTransactionStatusDTO(), {
        status: databaseRecord.transactionStatus,
        info,
      })
    } catch (error) {
      throw new Error(error)
    }
  }

  async getVaultKeysByWalletAddress(walletAddress: string): Promise<VaultKeysDto[]> {
    const TokensByWalletAddressQuery = `
      query GetTokensByWalletAddress {
        shareTokenOwnerships(where: { walletAddress: "${walletAddress}" }) {
          tokenAddress
          tokenId
          walletAddress
          amount
        }
      }
    `

    const { data: ownershipByAddress } = await this.graphClient.query<OwnershipType>(TokensByWalletAddressQuery, {}).toPromise()

    if (!ownershipByAddress || ownershipByAddress.shareTokenOwnerships.length <= 0) return []
    this.logger.log('VaultService => getVaultKeysByWalletAddress => ownershipByAddress', JSON.stringify(ownershipByAddress))
    const ownerships = await Promise.all(
      ownershipByAddress.shareTokenOwnerships
        .filter((ownership) => ownership.amount > 0)
        .map(async (ownership) => ({
          ...ownership,
          claimable: await this.getVaultKeyClaimable(ownership.tokenAddress, ownership.walletAddress, ownership.tokenId),
        }))
    )
    this.logger.log('VaultService => getVaultKeysByWalletAddress => ownerships', JSON.stringify(ownerships))
    const shareHolderAddressToValue = await this.getShareHolderAddressToVault()
    this.logger.log('VaultService => getVaultKeysByWalletAddress => shareHolderAddressToValue', JSON.stringify(shareHolderAddressToValue))
    return ownerships
      .map((ownership) => {
        this.logger.log('VaultService => getVaultKeysByWalletAddress => ownership.tokenAddress', ownership.tokenAddress.toString())
        const vaultInfo = shareHolderAddressToValue.get(ownership.tokenAddress.toLowerCase())

        if (!vaultInfo) return null

        this.logger.log(
          'VaultService => getVaultKeysByWalletAddress => complete info',
          JSON.stringify({
            ...ownership,
            ...vaultInfo,
          })
        )
        return {
          ...ownership,
          ...vaultInfo,
        }
      })
      .filter((ownership) => ownership !== null)
  }

  private async getShareHolderAddressToVault() {
    const records = this.dataMapper.scan(VaultEntity)
    const result: Map<string, VaultEntity> = new Map()
    for await (const vault of records) {
      if (!vault.shareholderManagerAddress) {
        this.logger.log('VaultService => getShareHolderAddressToVault => !vault.shareholderManagerAddress', JSON.stringify(vault))
        continue
      }
      this.logger.log('VaultService => getShareHolderAddressToVault => after continue', JSON.stringify(vault))
      result.set(vault.shareholderManagerAddress.toLowerCase(), vault)
    }

    this.logger.log('VaultService => getShareHolderAddressToVault => result', JSON.stringify(result))
    return result
  }

  private async getVaultTotalEarnedFunds(vaultAddress: string): Promise<string> {
    return await new FundsDistributor__factory()
      .connect(await this.ethRpcService.getRpcProvider())
      .attach(vaultAddress)
      .getFunction('totalEarnedFunds')
      .staticCall()
      .then((value) => value.toString())
      .catch(() => 0)
  }

  private async getVaultKeyClaimable(tokenAddress: string, walletAddress: string, tokenId: string): Promise<string> {
    return await new ShareRolesManager__factory()
      .connect(await this.ethRpcService.getRpcProvider())
      .attach(tokenAddress)
      .getFunction('claim')
      .staticCall(walletAddress, tokenId)
      .then((value) => value.toString())
      .catch(() => 0)
  }

  private async getVaultRoleInfo(vault: VaultEntity, roleIndex: number, totalPaid?: string) {
    let totalIncome = '0'

    // eslint-disable-next-line no-undefined
    if (totalPaid !== undefined) {
      const funds = Number(totalPaid) - Number(totalPaid) * (vault.vaultFeePercentage / 100)

      totalIncome = vault.profitSwitchAmount
        ? (funds <= vault.profitSwitchAmount * 1_000_000
            ? '0'
            : (funds - vault.profitSwitchAmount * 1_000_000) * (vault.roles[roleIndex].sharePercentage / 100)
          ).toString()
        : (funds * (vault.roles[roleIndex].sharePercentage / 100)).toString()
    }

    const tokenAddress = vault.shareholderManagerAddress
    const alreadyClaimed = await new ShareHolderVault__factory()
      .connect(await this.ethRpcService.getRpcProvider())
      .attach(vault.roles[roleIndex].shareHolderRoleAddress)
      .getFunction('alreadyClaimed')
      .staticCall()
      .then((value) => value)
      .catch(() => false)

    const TokensByTokenAddressQuery = `
      query GetTokensByWalletAddress {
        shareTokenOwnerships(where: { tokenAddress: "${tokenAddress}", tokenId: "${roleIndex}", amount: "1" }) {
          tokenAddress
          tokenId
          walletAddress
          amount
        }
      }
    `
    const { data: ownershipByToken } = await this.graphClient.query<OwnershipType>(TokensByTokenAddressQuery, {}).toPromise()

    let walletAddress: string | undefined
    let claimable = '0'

    if (!ownershipByToken || ownershipByToken.shareTokenOwnerships.length <= 0) {
      // eslint-disable-next-line no-undefined
      walletAddress = undefined
    } else {
      const ownership = ownershipByToken.shareTokenOwnerships[0]
      // eslint-disable-next-line prefer-destructuring
      walletAddress = ownership.walletAddress
      claimable = await this.getVaultKeyClaimable(ownership.tokenAddress, ownership.walletAddress, ownership.tokenId)
    }

    return {
      tokenId: roleIndex.toString(),
      claimable,
      totalIncome,
      tokenAddress,
      walletAddress,
      alreadyClaimed,
    }
  }

  private async getVaultFundsStatistics(vaultAddress: string): Promise<{ amount: string; date: string }[]> {
    this.logger.log(`VaultService => getVaultFundsStatistics => "${vaultAddress}"`)
    const activities = (await this.addressActivityService.find(vaultAddress)) as Record<any, any>[]

    this.logger.log(`VaultService => getVaultFundsStatistics => activities ${JSON.stringify(activities)}`)
    const aggr = Object.values(
      activities.reduce((accumulator, value) => {
        const date = new Date(Number(value.createdAt))
        this.logger.log(`VaultService => getVaultFundsStatistics => date ${value}`)
        const dateStr = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`

        const amount = value.value || 0

        accumulator[dateStr] ? (accumulator[dateStr].amount += amount) : (accumulator[dateStr] = { amount, date: dateStr })
        return accumulator
      }, {})
    )
      .map((item) => ({ ...item, amount: item.amount.toString() }))
      .sort((a, b) => new Date(a.date).valueOf() - new Date(b.date).valueOf())

    this.logger.log(`VaultService => getVaultFundsStatistics => aggr ${JSON.stringify(aggr)}`)

    return aggr
  }

  async signVaultTransaction({
    user,
    vaultId,
    encryptedPrivateKey,
    address,
  }: {
    user: UsersEntity
    vaultId: string
    encryptedPrivateKey: string
    address: string
  }): Promise<string | null> {
    // eslint-disable-next-line no-useless-catch
    try {
      this.logger.log('VaultService => signVaultTransaction => check KYC for user', user.auth0Id)
      const isKYCCompleted = await this.personaService.checkUserKYCStatus(user.auth0Id)

      if (!isKYCCompleted) {
        this.logger.log('VaultService => signVaultTransaction => KYC not completed', user.auth0Id)
        return null
      }
      const records = await queryRecords(this.dataMapper, { vaultId }, { indexName: 'vaultIdIndex' }, ShareHoldersClaimAccountsEntity)
      const shareHolderClaimAccount = records.find((record) => record.userEmail === user.email)

      if (!shareHolderClaimAccount) {
        this.logger.log('VaultService => signVaultTransaction => ShareHoldersClaimAccountsEntity not found', vaultId)
        return null
      }

      if (!shareHolderClaimAccount.iv || !shareHolderClaimAccount.secretKey || !shareHolderClaimAccount.authTag) {
        this.logger.log('VaultService => signVaultTransaction => ShareHoldersClaimAccountsEntity has no decrypt info', vaultId)
        return null
      }

      const { iv, secretKey, authTag } = shareHolderClaimAccount
      const privateKey = decrypt({ iv, secretKey, authTag, encrypted: encryptedPrivateKey })

      const signingKey = new ethers.Wallet(privateKey)
      const hash = ethers.solidityPackedKeccak256(['address'], [address])
      return signingKey.signMessage(ethers.getBytes(hash))
    } catch (error) {
      throw error
    }
  }

  async createVaultAdressesWebhook() {
    try {
      this.logger.log('VaultService => createVaultAdressesWebhook => getting addresses')
      const addresses = await this.getAllVaultsAddresses()

      this.logger.log(`VaultService => createVaultAdressesWebhook => addresses [${addresses.join(', ')}]`)

      this.logger.log('VaultService => createVaultAdressesWebhook => creating webhook')
      this.logger.log('VaultService => createVaultAdressesWebhook => webhook created')
    } catch (error) {
      this.logger.error(error)
      throw new Error(error)
    }
  }

  async onModuleInit() {
    try {
      const isInitialized = await this.addressActivityService.initialized()

      this.logger.log(`VaultService => onModuleInit => historical data fetched: ${isInitialized}`)

      if (!isInitialized) {
        await this.createVaultAdressesWebhook()
        await this.addressActivityService.init()
      }
    } catch (error) {
      console.trace(error)
      Logger.error(error)
      throw new Error(error)
    }
  }
}
