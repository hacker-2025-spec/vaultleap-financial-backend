import { DataMapper } from '@nova-odm/mapper'
import { ConfigService } from '@nestjs/config'
import { Inject, Injectable, Logger } from '@nestjs/common'
import type { PutEventsCommandInput } from '@aws-sdk/client-eventbridge'
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge'

import { VaultService } from '../vault/vault.service'
import { ConfigKeys } from '../config/config.interface'
import { TaxInfoService } from '../tax-info/tax-info.service'
import type { VaultTransactionStatusDTO } from '../vault/vault.dto'
import { CreatorHandlerService } from '../creator-handler/creator-handler.service'
import { TRANSACTION_STATUS } from '../evm-transaction-sender/evm-transaction-sender.types'

import { VaultsCreationStatus } from './vaults-creator.types'
import { VaultsCreatorEntity } from './vaults-creator.entity'
import { EventBridgeResponseError } from './vaults-creator.errors'
import type { VaultsCreatorConfigDto } from './vaults-creator.dto'
import type { VaultsCreatorRequestData } from './vaults-creator.types'
import { VaultsCreationStatusDto, VaultsCreatorDto } from './vaults-creator.dto'
import { CreatorVaultDto } from './creator-vault.dto'

@Injectable()
export class VaultsCreatorService {
  private readonly logger = new Logger(VaultsCreatorService.name)
  private readonly EVENT_BUS_NAME: string

  public constructor(
    protected dataMapper: DataMapper,
    @Inject(EventBridgeClient) private eventBridge: EventBridgeClient,
    protected vaultService: VaultService,
    protected taxInfoService: TaxInfoService,
    protected creatorHandlerService: CreatorHandlerService,
    private configService: ConfigService
  ) {
    this.EVENT_BUS_NAME = this.configService.get(`${ConfigKeys.EVM_EVENT_BUS_NAME}`) || ''
  }

  async sendEvent(vaultsId: string, vaults: CreatorVaultDto[]): Promise<void> {
    const request: VaultsCreatorRequestData = {
      id: vaultsId,
      collection: vaults,
    }
    const input: PutEventsCommandInput = {
      Entries: [
        {
          Time: new Date(),
          Source: 'getrewards.api',
          EventBusName: this.EVENT_BUS_NAME,
          DetailType: 'vaults-creator-event',
          Detail: JSON.stringify(request),
        },
      ],
    }
    this.logger.log(`Putting event: ${JSON.stringify(input, null, 2)}`)

    const putEventsCommand = new PutEventsCommand(input)
    const event = await this.eventBridge.send(putEventsCommand)
    await this.changeVaultsStatus(vaultsId, VaultsCreationStatus.PROCESSING)

    if (event?.FailedEntryCount && event?.FailedEntryCount !== 0) {
      this.logger.error('Failed to send event', JSON.stringify(event.Entries))
      throw new EventBridgeResponseError(JSON.stringify(event.Entries))
    }
  }

  async createVaults(auth0Id: string, vaultsConfig: VaultsCreatorConfigDto): Promise<VaultsCreatorDto> {
    try {
      this.logger.log('VaultsCreatorService => createVaults => auth0Id', auth0Id)
      this.logger.log('VaultsCreatorService => createVaults => vaultsConfig', JSON.stringify(vaultsConfig))
      if (!vaultsConfig.vaults[0].agreeToTOSAndPP) {
        throw new Error('Needs to agree to TOS and PP')
      }

      const record = await this.dataMapper.put(
        Object.assign(new VaultsCreatorEntity(), {
          auth0Id,
          vaults: vaultsConfig.vaults,
          taxFormEnabled: vaultsConfig.taxFormEnabled,
          ownerTaxInfo: vaultsConfig.ownerTaxInfo,
          creationStatus: VaultsCreationStatus.CREATED,
        })
      )
      this.logger.log('VaultsCreatorService => createVaults => record', JSON.stringify(record))

      const databaseVaults: CreatorVaultDto[] = []
      for await (const vault of vaultsConfig.vaults) {
        const vaultRecord = await this.vaultService.createVault({ ...vault, taxFormEnabled: vaultsConfig.taxFormEnabled })
        this.logger.log('VaultsCreatorService => createVaults => vaultRecord', JSON.stringify(vaultRecord))
        // eslint-disable-next-line no-undefined
        if (Boolean(vaultRecord.id) && vaultRecord.taxFormEnabled && vaultsConfig.ownerTaxInfo !== undefined) {
          await this.taxInfoService.createTaxInfo(auth0Id, { ...vaultsConfig.ownerTaxInfo, vaultId: vaultRecord.id })
        }
        databaseVaults.push(Object.assign(new CreatorVaultDto(), vaultRecord))
      }

      await this.updateVaultsByVaultsId(record.id, databaseVaults)
      await this.sendEvent(record.id, databaseVaults)
      return Object.assign(new VaultsCreatorDto(), {
        ...record,
        vaults: databaseVaults,
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new Error(error)
    }
  }

  async updateVaultsByVaultsId(id: string, vaults: CreatorVaultDto[]): Promise<void> {
    try {
      this.logger.log('VaultsCreatorService => updateVaultsByVaultsId => id', id)
      this.logger.log('VaultsCreatorService => updateVaultsByVaultsId => vaults', JSON.stringify(vaults))
      const record = await this.getVaultsById(id)
      await this.dataMapper.update(
        Object.assign(new VaultsCreatorEntity(), {
          ...record,
          vaults,
        })
      )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new Error(error)
    }
  }

  async updateVaultByIds(id: string, vaultId: string): Promise<void> {
    try {
      this.logger.log('VaultsCreatorService => updateVaultByIds => id', id)
      this.logger.log('VaultsCreatorService => updateVaultByIds => vaultId', vaultId)
      const vaultsRecord = await this.getVaultsById(id)
      const record = await this.vaultService.getVaultById(vaultId)
      // eslint-disable-next-line no-undefined
      if (record !== undefined) {
        const index = vaultsRecord.vaults.findIndex((vault) => vault.id === record.id)

        if (index >= 0) {
          vaultsRecord.vaults[index] = Object.assign(new CreatorVaultDto(), record)
          await this.dataMapper.update(Object.assign(new VaultsCreatorEntity(), vaultsRecord))
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new Error(error)
    }
  }

  async getVaultsById(id: string): Promise<VaultsCreatorDto> {
    try {
      this.logger.log('VaultsCreatorService => getVaultsById => id', id)
      const record = await this.dataMapper.get(Object.assign(new VaultsCreatorEntity(), { id }))
      this.logger.log('VaultsCreatorService => getVaultsById => record', JSON.stringify(record))
      return Object.assign(new VaultsCreatorDto(), record)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new Error(error)
    }
  }

  async getVaultsStatus(id: string): Promise<VaultsCreationStatusDto> {
    try {
      this.logger.log('VaultsCreatorService => getVaultsStatus => id', id)
      const record = await this.getVaultsById(id)
      this.logger.log('VaultsCreatorService => getVaultsStatus => creationStatus', record.creationStatus)
      return Object.assign(new VaultsCreationStatusDto(), { status: record.creationStatus })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new Error(error)
    }
  }

  async changeVaultsStatus(id: string, status: VaultsCreationStatus): Promise<void> {
    try {
      this.logger.log('VaultsCreatorService => changeStatus => id', id)
      this.logger.log('VaultsCreatorService => changeStatus => status', status)

      const record = await this.getVaultsById(id)
      record.creationStatus = status

      await this.dataMapper.update(Object.assign(new VaultsCreatorEntity(), record))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new Error(error)
    }
  }

  async createSeparatedVault(id: string, vaultIndex: number, taskToken: string): Promise<void> {
    try {
      this.logger.log('VaultsCreatorService => createSeparatedVault => id', id)
      this.logger.log('VaultsCreatorService => createSeparatedVault => vaultIndex', vaultIndex)
      const record = await this.getVaultsById(id)
      const vaultData = record.vaults[vaultIndex]

      // eslint-disable-next-line no-undefined
      if (vaultData !== undefined && vaultData.id !== undefined) {
        const data = await this.creatorHandlerService.processCreatorConfigSubmission(
          vaultData.id,
          vaultData.userId,
          vaultData.adminWalletAddress,
          taskToken
        )
        this.logger.log('VaultsCreatorService => createSeparatedVault => data', JSON.stringify(data))
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      await this.changeVaultsStatus(id, VaultsCreationStatus.REJECTED)
      throw new Error(error)
    }
  }

  async processCreationTransactionStatus(id: string, vaultIndex: number): Promise<void> {
    try {
      this.logger.log('VaultsCreatorService => processCreationTransactionStatus => id', id)
      this.logger.log('VaultsCreatorService => processCreationTransactionStatus => vaultIndex', vaultIndex)
      const record = await this.getVaultsById(id)
      const vaultData = record.vaults[vaultIndex]

      // eslint-disable-next-line no-undefined
      if (vaultData !== undefined && vaultData.id !== undefined) {
        const response: VaultTransactionStatusDTO = await this.vaultService.getTransactionStatus(vaultData.id)

        this.logger.log('VaultsCreatorService => processCreationTransactionStatus => response', response)
        if (response.status === TRANSACTION_STATUS.REJECTED) {
          await this.changeVaultsStatus(id, VaultsCreationStatus.REJECTED)
          throw new Error('Vault creation failed')
        }
        if (response.status === TRANSACTION_STATUS.SUCCESSFUL) {
          await this.updateVaultByIds(id, vaultData.id)
          if (record.vaults.length - 1 === vaultIndex) await this.changeVaultsStatus(id, VaultsCreationStatus.SUCCESS)
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      await this.changeVaultsStatus(id, VaultsCreationStatus.REJECTED)
      throw new Error(error)
    }
  }
}
