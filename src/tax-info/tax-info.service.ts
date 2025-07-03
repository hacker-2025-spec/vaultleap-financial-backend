import { DataMapper } from '@nova-odm/mapper'
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common'

import { VaultService } from '../vault/vault.service'
import { TaxFormService } from '../tax-form/tax-form.service'
import { createRecord, queryRecords } from '../utils/dynamoDbHelpers'

import { TaxFormType } from './tax-info.types'
import { TaxInfoEntity } from './tax-info.entity'
import type { TaxInfoCreationDto } from './tax-info.dto'
import { VaultWithTaxInfoDto, TaxInfoDto } from './tax-info.dto'

@Injectable()
export class TaxInfoService {
  private readonly logger = new Logger(TaxInfoService.name)

  public constructor(
    protected dataMapper: DataMapper,
    protected vaultService: VaultService,
    @Inject(forwardRef(() => TaxFormService)) protected taxFormService: TaxFormService
  ) {}

  async createTaxInfo(auth0Id: string, informationConfig: TaxInfoCreationDto): Promise<TaxInfoDto> {
    try {
      this.logger.log('TaxInfoService => createTaxInfo => auth0Id', auth0Id)
      this.logger.log('TaxInfoService => createTaxInfo => informationConfig', JSON.stringify(informationConfig))
      await this.vaultService.markTaxInfoProvidedToVault(informationConfig.vaultId, informationConfig.shareHolderRoleAddress)

      const taxInfoRecord = await createRecord(
        this.dataMapper,
        {
          auth0Id,
          ...informationConfig,
        },
        TaxInfoEntity
      )
      this.logger.log('TaxInfoService => createTaxInfo => taxInfoRecord', JSON.stringify(taxInfoRecord))

      if (informationConfig.formType === TaxFormType.FORM_W9) {
        await this.taxFormService.createW9TaxForm(
          informationConfig.vaultId,
          informationConfig.w9FormDetails!.fullName,
          informationConfig.shareHolderRoleAddress!
        )
      }
      if (informationConfig.formType === TaxFormType.FORM_W8_BEN) {
        await this.taxFormService.createW8BenTaxForm(
          informationConfig.vaultId,
          informationConfig.w8BenFormDetails!.ownerName,
          informationConfig.shareHolderRoleAddress!
        )
      }
      if (informationConfig.formType === TaxFormType.FORM_W8_BEN_E) {
        await this.taxFormService.createW8BenETaxForm(
          informationConfig.vaultId,
          informationConfig.w8BenEFormDetails!.organizationName,
          informationConfig.shareHolderRoleAddress!
        )
      }

      return Object.assign(new TaxInfoDto(), taxInfoRecord)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new Error(error)
    }
  }

  async getTaxInfoByVaultIdAndTokenAddress(vaultId: string, tokenAddress?: string): Promise<TaxInfoDto> {
    try {
      this.logger.log('TaxInfoService => getTaxInfoByVaultIdAndTokenAddress => vaultId', vaultId)
      this.logger.log('TaxInfoService => getTaxInfoByVaultIdAndTokenAddress => tokenAddress', tokenAddress)
      const taxInfos = await queryRecords(this.dataMapper, { vaultId }, { indexName: 'vaultIdIndex' }, TaxInfoEntity)
      this.logger.log('TaxInfoService => getTaxInfoByVaultIdAndTokenAddress => taxInfos', JSON.stringify(taxInfos))
      let matchingTaxInfo = {}
      for (const taxInfo of taxInfos) {
        // eslint-disable-next-line no-undefined
        if (!tokenAddress && taxInfo.formType === TaxFormType.FORM_1099) matchingTaxInfo = taxInfo
        if (tokenAddress && taxInfo.shareHolderRoleAddress === tokenAddress) matchingTaxInfo = taxInfo
      }
      this.logger.log('TaxInfoService => getTaxInfoByVaultIdAndTokenAddress => matchingTaxInfo', JSON.stringify(matchingTaxInfo))
      return Object.assign(new TaxInfoDto(), matchingTaxInfo)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new Error(error)
    }
  }

  async getAllTaxInfoByVaultId(vaultId: string, formType?: TaxFormType): Promise<TaxInfoDto[]> {
    try {
      this.logger.log('TaxInfoService => getAllTaxInfoByVaultId => vaultId', vaultId)
      this.logger.log('TaxInfoService => getAllTaxInfoByVaultId => formType', formType)
      const taxInfoRecord = await queryRecords(this.dataMapper, { vaultId }, { indexName: 'vaultIdIndex' }, TaxInfoEntity)
      const taxInfoList = []
      for await (const record of taxInfoRecord) {
        taxInfoList.push(Object.assign(new TaxInfoDto(), record))
      }
      this.logger.log('TaxInfoService => getAllTaxInfoByVaultId => taxInfoList', JSON.stringify(taxInfoList))
      if (formType) {
        return taxInfoList.filter((info) => info.formType === formType)
      }
      return taxInfoList
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new Error(error)
    }
  }

  async getLatestVaultOwnerTaxInfo(auth0Id: string): Promise<VaultWithTaxInfoDto | undefined> {
    try {
      this.logger.log('TaxInfoService => getLatestVaultOwnerTaxInfo => auth0Id', auth0Id)
      const vault = await this.vaultService.getLatestVaultByOwnerUserId(auth0Id)
      this.logger.log('TaxInfoService => getLatestVaultOwnerTaxInfo => vault', JSON.stringify(vault))
      if (vault) {
        if (vault.taxFormEnabled) {
          const taxInfoList = await this.getAllTaxInfoByVaultId(vault.id, TaxFormType.FORM_1099)
          this.logger.log('TaxInfoService => getLatestVaultOwnerTaxInfo => taxInfoList[0]', JSON.stringify(taxInfoList[0]))
          return Object.assign(new VaultWithTaxInfoDto(), {
            vaultInfo: vault,
            taxInfo: taxInfoList[0],
          })
        }
        return Object.assign(new VaultWithTaxInfoDto(), { vaultInfo: vault })
      }
      // eslint-disable-next-line no-undefined
      return undefined
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new Error(error)
    }
  }
}
