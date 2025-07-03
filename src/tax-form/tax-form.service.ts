import { Client } from '@urql/core'
import { DataMapper } from '@nova-odm/mapper'
import { ConfigService } from '@nestjs/config'
import type { PutEventsCommandInput } from '@aws-sdk/client-eventbridge'
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge'
import { forwardRef, HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'

import { AuditService } from '../audit/audit.service'
import { VaultService } from '../vault/vault.service'
import { ConfigKeys } from '../config/config.interface'
import { generateRandomCode } from '../utils/randomCode'
import { TaxFormType } from '../tax-info/tax-info.types'
import type { UsersEntity } from '../users/users.entity'
import type { VaultEntity } from '../vault/vault.entity'
import { S3ExternalStorage } from '../aws/S3ExternalStorage'
import { TaxInfoService } from '../tax-info/tax-info.service'
import type { RemoveSecurityCodeInput } from '../lambdas/lambdas.types'
import { EmailSenderService } from '../email-sender/email-sender.service'
import { createRecord, getRecord, queryRecords } from '../utils/dynamoDbHelpers'
import type { AggregatedClaimsPerUserPerYearsType, AggregatedClaimsType } from '../vault/vault.types'

import { TaxFormEntity } from './tax-form.entity'
import { TaxFormDto, TaxFormVaultInfoDto } from './tax-form.dto'
import { TaxFormGenerator, TaxUserType } from './tax-form.generator'
import type { Form1099Data, TaxFormUserData } from './tax-form.types'
import type { TaxForm1099CreationDto, TaxFormCreationDto, RequestTaxFormAccessResponseDto, AccessTaxFormResponseDto } from './tax-form.dto'

@Injectable()
export class TaxFormService {
  private readonly EVENT_BUS_NAME: string
  private readonly logger = new Logger(TaxFormService.name)
  constructor(
    private vaultService: VaultService,
    @Inject(DataMapper) protected dataMapper: DataMapper,
    @Inject(EventBridgeClient) private eventBridge: EventBridgeClient,
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(TaxFormGenerator) private readonly taxFormGenerator: TaxFormGenerator,
    @Inject(forwardRef(() => TaxInfoService)) protected taxInfoService: TaxInfoService,
    private emailSenderService: EmailSenderService,
    private auditService: AuditService,
    private readonly s3ExternalStorage: S3ExternalStorage,
    protected graphClient: Client
  ) {
    this.EVENT_BUS_NAME = this.configService.get(`${ConfigKeys.EVM_EVENT_BUS_NAME}`) || ''
  }

  get bucketName() {
    return this.configService.get<string>(ConfigKeys.TAX_FORMS_BUCKET_NAME) || ''
  }

  /** Tax reporting threshold in USD */
  get taxForm1099AmountThreshold() {
    return 600
  }

  createTaxFormS3Key(formType: TaxFormType, userName: string) {
    const now = new Date()
    const formattedDate = now.toISOString().split('T')[0]
    const formattedName = userName.replaceAll(/\s/g, '_')
    return this.s3ExternalStorage.createS3Key(`${formType}_${formattedName}_${formattedDate}.pdf`)
  }

  /** Tax info re*/
  async getAllUserForms(auth0Id: string): Promise<TaxFormVaultInfoDto[]> {
    this.logger.log('TaxFormService => getAllUserForms => auth0Id', auth0Id)
    const userForms = await queryRecords(this.dataMapper, { auth0Id }, { indexName: 'auth0IdIndex' }, TaxFormEntity)
    const updatedForms = []
    for await (const userForm of userForms) {
      const vault = await this.vaultService.getVaultById(userForm.vaultId)
      // eslint-disable-next-line no-undefined
      if (userForm.taxYear === undefined) {
        updatedForms.push(
          Object.assign(new TaxFormVaultInfoDto(), {
            ...userForm,
            projectName: vault.projectName,
            taxYear: new Date(userForm.createdAt).getFullYear(),
          })
        )
      } else {
        updatedForms.push(
          Object.assign(new TaxFormVaultInfoDto(), {
            ...userForm,
            projectName: vault.projectName,
          })
        )
      }
    }
    this.logger.log('TaxFormService => getAllUserForms => updatedForms', JSON.stringify(updatedForms))
    return updatedForms
  }

  async createTaxForm(taxForm: TaxFormCreationDto): Promise<TaxFormDto> {
    try {
      this.logger.log('TaxFormService => createTaxForm => taxForm', JSON.stringify(taxForm))
      const taxFormRecord = await createRecord(this.dataMapper, taxForm, TaxFormEntity)
      this.logger.log('TaxFormService => createTaxForm => taxFormRecord', JSON.stringify(taxFormRecord))
      return Object.assign(new TaxFormDto(), taxFormRecord)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new Error(error)
    }
  }

  async getAllVaultsWithTaxFormsEnabled(): Promise<VaultEntity[]> {
    const vaultsForTaxReports = await this.vaultService.getAllTaxFormEnabledVaults()
    this.logger.log('TaxFormService => getAllVaultsWithTaxFormsEnabled => vaultsForTaxReports', JSON.stringify(vaultsForTaxReports))
    const filteredVaults = []
    for await (const vault of vaultsForTaxReports) {
      const taxInfos = await this.taxInfoService.getAllTaxInfoByVaultId(vault.id)
      if (taxInfos.some((info) => info.formType === TaxFormType.FORM_W9)) filteredVaults.push(vault)
    }
    this.logger.log(`Found ${filteredVaults.length} vaults with tax forms enabled`)
    this.logger.log('TaxFormService => getAllVaultsWithTaxFormsEnabled => filteredVaults', JSON.stringify(filteredVaults))
    return filteredVaults
  }

  async getAggregatedClaimData({
    vaultAddress,
    year,
  }: {
    vaultAddress: string
    year: string
  }): Promise<AggregatedClaimsPerUserPerYearsType | null> {
    this.logger.log('TaxFormService => getAggregatedClaimData => vaultAddress', vaultAddress)
    this.logger.log('TaxFormService => getAggregatedClaimData => year', year)
    const amountThreshold = this.taxForm1099AmountThreshold * 1_000_000
    const aggregatedClaimsPerUserPerYearsQuery = `
      query MyQuery {
        aggregatedClaimsPerUserPerYears(
          where: {vaultAddress: "${vaultAddress}", year: "${year}", amount_gte: "${amountThreshold}"}
      ) {
          amount
          id
          vaultAddress
          year
        }
      }
    `

    const { data: aggregatedClaims } = await this.graphClient
      .query<AggregatedClaimsType>(aggregatedClaimsPerUserPerYearsQuery, {})
      .toPromise()

    if (!aggregatedClaims) return null

    this.logger.log('TaxFormService => getAggregatedClaimData => aggregatedClaims', JSON.stringify(aggregatedClaims))
    return aggregatedClaims.aggregatedClaimsPerUserPerYears[0]
  }

  async get1099TaxFormData({
    vaultId,
    vaultAddress,
    year,
    payerData,
  }: {
    vaultId: string
    vaultAddress: string
    year: string
    payerData: TaxFormUserData
  }) {
    this.logger.log('TaxFormService => get1099TaxFormData => vaultId', vaultId)
    this.logger.log('TaxFormService => get1099TaxFormData => vaultAddress', vaultAddress)
    this.logger.log('TaxFormService => get1099TaxFormData => year', year)
    this.logger.log('TaxFormService => get1099TaxFormData => payerData', JSON.stringify(payerData))
    const aggregatedClaimsData = await this.getAggregatedClaimData({ vaultAddress, year })
    if (!aggregatedClaimsData) {
      this.logger.error(`No aggregated claims found for vault '${vaultAddress}' for year '${year}'`)
      return
    }

    const recipient = await this.taxInfoService.getTaxInfoByVaultIdAndTokenAddress(vaultId, vaultAddress)
    const recipientData = recipient.w9FormDetails
    if (!recipientData) {
      throw new Error(`Recipient data not found`)
    }
    this.logger.log('TaxFormService => get1099TaxFormData => recipientData', JSON.stringify(recipientData))

    const compensation = Number((Number(aggregatedClaimsData.amount) / 1_000_000).toFixed(2))
    this.logger.log('TaxFormService => get1099TaxFormData => compensation', compensation)

    const pdfData: Form1099Data = {
      payerDetails: {
        name: payerData.name,
        address: payerData.address,
        city: payerData.city,
        state: payerData.state,
        zip: payerData.zip,
        ssn: payerData.ssn,
        ein: payerData.ein,
        country: payerData.country,
      },
      recipientDetails: {
        name: recipientData.fullName,
        address: recipientData.address,
        city: recipientData.city,
        state: recipientData.state,
        zip: recipientData.zip,
        ssn: recipientData.ssn,
        ein: recipientData.ein,
        country: recipientData.country,
      },
      compensation: compensation.toString(),
      year,
    }
    this.logger.log('TaxFormService => get1099TaxFormData => taxFormData', JSON.stringify(pdfData))
    this.logger.log('TaxFormService => get1099TaxFormData => recipientAuth0Id', recipient.auth0Id)
    return {
      taxFormData: pdfData,
      recipientAuth0Id: recipient.auth0Id,
    }
  }

  async getPayerAddress(vaultId: string): Promise<TaxFormUserData> {
    this.logger.log('TaxFormService => getPayerAddress => vaultId', vaultId)
    const taxInfoData = await this.taxInfoService.getTaxInfoByVaultIdAndTokenAddress(vaultId)
    this.logger.log('TaxFormService => getPayerAddress => taxInfoData', JSON.stringify(taxInfoData))
    const taxInfo = taxInfoData.t1099FormDetails
    if (
      !taxInfo?.businessName ||
      !taxInfo?.address ||
      !taxInfo?.city ||
      !taxInfo?.state ||
      !taxInfo?.zip ||
      (!taxInfo?.ssn && !taxInfo?.ein) ||
      !taxInfo?.country
    ) {
      throw new Error(`No tax data for Payer, vault '${vaultId}'`)
    }
    this.logger.log('TaxFormService => getPayerAddress => taxInfo', JSON.stringify(taxInfo))
    return {
      name: taxInfo?.businessName,
      address: taxInfo?.address,
      city: taxInfo?.city,
      state: taxInfo?.state,
      zip: taxInfo?.zip,
      ssn: taxInfo?.ssn,
      ein: taxInfo?.ein,
      country: taxInfo?.country,
    }
  }

  async generateYearly1099TaxFormsForVault({ vaultId, year }: { vaultId: string; year: string }) {
    this.logger.log('TaxFormService => generateYearly1099TaxFormsForVault => vaultId', vaultId)
    this.logger.log('TaxFormService => generateYearly1099TaxFormsForVault => year', year)
    const vault = await this.vaultService.getVaultById(vaultId)
    this.logger.log('TaxFormService => generateYearly1099TaxFormsForVault => vault', JSON.stringify(vault))
    const payerAuth0Id = vault.userId
    const payerAddress = await this.getPayerAddress(vaultId)
    for (const role of vault.roles) {
      const vaultAddress = role.shareHolderRoleAddress
      if (!vaultAddress) {
        // Should not happen?
        this.logger.error(
          `shareHolderRoleAddress address not found for role '${role.name}' in vault '${vaultId}', skipping 1099 generation`
        )
        continue
      }
      try {
        // eslint-disable-next-line no-await-in-loop
        const formData = await this.get1099TaxFormData({ vaultId, vaultAddress, year, payerData: payerAddress })
        this.logger.log('TaxFormService => generateYearly1099TaxFormsForVault => formData', JSON.stringify(formData))
        if (!formData) continue
        // eslint-disable-next-line no-await-in-loop
        await this.create1099TaxForms({
          vaultId: vault.id,
          payerAuth0Id,
          recipientAuth0Id: formData.recipientAuth0Id,
          payerName: formData.taxFormData.payerDetails.name,
          recipientName: formData.taxFormData.recipientDetails.name,
          shareHolderRoleAddress: vaultAddress,
          taxYear: Number(formData.taxFormData.year),
        })
      } catch (error) {
        this.logger.error(`Error generating 1099 for role '${role.name}' vault '${vaultId}'`)
        this.logger.error(error)
      }
    }
    this.logger.log(`Finished generating yearly 1099 tax forms for vault ${vaultId}`)
  }

  async accessTaxFormById(auth0Id: string, id: string, securityCode: string): Promise<AccessTaxFormResponseDto> {
    this.logger.log('TaxFormService => accessTaxFormById => auth0Id', auth0Id)
    this.logger.log('TaxFormService => accessTaxFormById => id', id)
    let taxForm: TaxFormEntity
    try {
      taxForm = await getRecord(this.dataMapper, id, TaxFormEntity)
    } catch {
      throw new HttpException('Tax form not found', HttpStatus.NOT_FOUND)
    }
    if (taxForm.auth0Id !== auth0Id) throw new HttpException('Cannot perform this action', HttpStatus.BAD_REQUEST)
    if (taxForm.securityCode !== securityCode) throw new HttpException('Wrong security code', HttpStatus.BAD_REQUEST)

    this.logger.log('TaxFormService => accessTaxFormById => taxForm', JSON.stringify(taxForm))
    const downloadUrl = await this.s3ExternalStorage.generateSignedDownloadUrl(taxForm.s3Key, this.bucketName)
    return { s3Key: taxForm.s3Key, downloadUrl }
  }

  async requestTaxFormAccess(user: UsersEntity, ipAddress: string, id: string): Promise<RequestTaxFormAccessResponseDto> {
    const taxForm = await getRecord(this.dataMapper, id, TaxFormEntity)
    this.logger.log('TaxFormService => requestTaxFormAccess => taxForm', JSON.stringify(taxForm))

    if (!taxForm) throw new HttpException('Tax form not found', HttpStatus.NOT_FOUND)
    if (taxForm.securityCode) return { status: 'success' }
    if (taxForm.auth0Id !== user.auth0Id) throw new HttpException('Cannot perform this action', HttpStatus.BAD_REQUEST)

    const randomCode = generateRandomCode(6)
    const updatedTaxForm = await this.dataMapper.update(Object.assign(new TaxFormEntity(), { ...taxForm, securityCode: randomCode }))

    const date = Date.now()
    this.logger.log('TaxFormService => requestTaxFormAccess => updatedTaxForm', JSON.stringify(updatedTaxForm))
    if (updatedTaxForm.formType === TaxFormType.FORM_1099 && Boolean(updatedTaxForm.userType)) {
      await this.createAndSave1099TaxForm(updatedTaxForm, date)
    }
    if (updatedTaxForm.formType === TaxFormType.FORM_W9) {
      await this.createAndSaveW9TaxForm(updatedTaxForm, date)
    }
    if (updatedTaxForm.formType === TaxFormType.FORM_W8_BEN) {
      await this.createAndSaveW8BenTaxForm(updatedTaxForm, date)
    }
    if (updatedTaxForm.formType === TaxFormType.FORM_W8_BEN_E) {
      await this.createAndSaveW8BenETaxForm(updatedTaxForm, date)
    }

    const timestamp = new Date(date).toISOString()
    await this.auditService.addAudit(updatedTaxForm.id, user.auth0Id, {
      timestamp,
      action: 'access_requested',
      status: 'success',
      ip: ipAddress,
    })
    await this.emailSenderService.sendSecureAccessTaxFormEmail(user.email, user.name, randomCode, timestamp, ipAddress)
    await this.startRemoveSecurityCodeAfterTime(updatedTaxForm.id)
    return { status: 'success' }
  }

  async taxFormDownloaded(user: UsersEntity, ipAddress: string, id: string): Promise<void> {
    this.logger.log('TaxFormService => taxFormDownloaded => user', JSON.stringify(user))
    this.logger.log('TaxFormService => taxFormDownloaded => id', id)
    const timestamp = new Date().toISOString()
    await this.auditService.addAudit(id, user.auth0Id, {
      timestamp,
      action: 'document_downloaded',
      status: 'complete',
      ip: ipAddress,
    })
  }

  async removeTaxFormSecurityCode(id: string): Promise<void> {
    this.logger.log('TaxFormService => removeTaxFormSecurityCode => id', id)
    const taxForm = await getRecord(this.dataMapper, id, TaxFormEntity)
    await this.dataMapper.update(
      Object.assign(new TaxFormEntity(), {
        id: taxForm.id,
        auth0Id: taxForm.auth0Id,
        vaultId: taxForm.vaultId,
        s3Key: taxForm.s3Key,
        shareHolderRoleAddress: taxForm.shareHolderRoleAddress,
        formType: taxForm.formType,
        userType: taxForm.userType,
        taxYear: taxForm.taxYear,
        createdAt: taxForm.createdAt,
      })
    )
  }

  async removeTaxFormSecurityCodeAfterTime(event: RemoveSecurityCodeInput['Event']): Promise<void> {
    await this.removeTaxFormSecurityCode(event.detail.id)
    const taxForm = await getRecord(this.dataMapper, event.detail.id, TaxFormEntity)
    await this.s3ExternalStorage.deleteFile({
      s3Key: taxForm.s3Key,
      bucketName: this.bucketName,
    })
  }

  async startRemoveSecurityCodeAfterTime(id: string): Promise<void> {
    this.logger.log('TaxFormService => startRemoveSecurityCodeAfterTime => id', id)
    const input: PutEventsCommandInput = {
      Entries: [
        {
          Time: new Date(),
          Source: 'getrewards.api',
          EventBusName: this.EVENT_BUS_NAME,
          DetailType: 'start-remove-security-code-event',
          Detail: JSON.stringify({ id }),
        },
      ],
    }
    this.logger.log(`Putting event: ${JSON.stringify(input, null, 2)}`)

    const putEventsCommand = new PutEventsCommand(input)
    const event = await this.eventBridge.send(putEventsCommand)

    if (event?.FailedEntryCount && event?.FailedEntryCount !== 0) {
      this.logger.log('Failed to send event', JSON.stringify(event.Entries))
    }
  }

  async create1099TaxForms(details: TaxForm1099CreationDto) {
    const payerPdfName = this.createTaxFormS3Key(TaxFormType.FORM_1099, details.payerName)
    await this.createTaxForm({
      auth0Id: details.payerAuth0Id,
      vaultId: details.vaultId,
      s3Key: payerPdfName,
      shareHolderRoleAddress: details.shareHolderRoleAddress,
      formType: TaxFormType.FORM_1099,
      userType: TaxUserType.PAYER,
      taxYear: details.taxYear,
    })

    const recipientPdfName = this.createTaxFormS3Key(TaxFormType.FORM_1099, details.recipientName)
    await this.createTaxForm({
      auth0Id: details.recipientAuth0Id,
      vaultId: details.vaultId,
      s3Key: recipientPdfName,
      shareHolderRoleAddress: details.shareHolderRoleAddress,
      formType: TaxFormType.FORM_1099,
      userType: TaxUserType.RECIPIENT,
      taxYear: details.taxYear,
    })
  }

  async createW9TaxForm(vaultId: string, recipientName: string, shareHolderRoleAddress: string) {
    let vault
    try {
      vault = await this.vaultService.getVaultById(vaultId)
    } catch {
      this.logger.error(`Vault '${vaultId}' not found, skipping W9 form generation`)
      return
    }

    const payerAuth0Id = vault.userId
    const pdfName = this.createTaxFormS3Key(TaxFormType.FORM_W9, recipientName)
    await this.createTaxForm({
      auth0Id: payerAuth0Id,
      vaultId,
      s3Key: pdfName,
      shareHolderRoleAddress,
      formType: TaxFormType.FORM_W9,
      taxYear: Number(new Date().getFullYear()),
    })
  }

  async createW8BenTaxForm(vaultId: string, recipientName: string, shareHolderRoleAddress: string) {
    let vault
    try {
      vault = await this.vaultService.getVaultById(vaultId)
    } catch {
      this.logger.error(`Vault '${vaultId}' not found, skipping W8-Ben form generation`)
      return
    }

    const payerAuth0Id = vault.userId
    const pdfName = this.createTaxFormS3Key(TaxFormType.FORM_W8_BEN, recipientName)
    await this.createTaxForm({
      auth0Id: payerAuth0Id,
      vaultId,
      s3Key: pdfName,
      shareHolderRoleAddress,
      formType: TaxFormType.FORM_W8_BEN,
      taxYear: Number(new Date().getFullYear()),
    })
  }

  async createW8BenETaxForm(vaultId: string, recipientName: string, shareHolderRoleAddress: string) {
    let vault
    try {
      vault = await this.vaultService.getVaultById(vaultId)
    } catch {
      this.logger.error(`Vault '${vaultId}' not found, skipping W8-Ben-E form generation`)
      return
    }

    const payerAuth0Id = vault.userId
    const pdfName = this.createTaxFormS3Key(TaxFormType.FORM_W8_BEN_E, recipientName)
    await this.createTaxForm({
      auth0Id: payerAuth0Id,
      vaultId,
      s3Key: pdfName,
      shareHolderRoleAddress,
      formType: TaxFormType.FORM_W8_BEN_E,
      taxYear: Number(new Date().getFullYear()),
    })
  }

  async createAndSave1099TaxForm(taxForm: TaxFormEntity, date: number) {
    this.logger.log('TaxFormService => createAndSave1099TaxForm => taxForm', JSON.stringify(taxForm))
    const payerAddress = await this.getPayerAddress(taxForm.vaultId)
    const formData = await this.get1099TaxFormData({
      vaultId: taxForm.vaultId,
      vaultAddress: taxForm.shareHolderRoleAddress,
      year: taxForm.taxYear.toString(),
      payerData: payerAddress,
    })
    this.logger.log('TaxFormService => createAndSave1099TaxForm => payerAddress', JSON.stringify(payerAddress))
    this.logger.log('TaxFormService => createAndSave1099TaxForm => formData', JSON.stringify(formData))
    if (!formData || !taxForm.userType) return
    this.logger.log('TaxFormService => createAndSave1099TaxForm => generate1099TaxFormPdf')
    const pdf = await this.taxFormGenerator.generate1099TaxFormPdf(formData.taxFormData, taxForm.userType, taxForm.securityCode!, date)
    this.logger.log('TaxFormService => createAndSave1099TaxForm => generated')
    await this.s3ExternalStorage.uploadFile({
      s3Key: taxForm.s3Key,
      fileBody: pdf,
      contentType: 'application/pdf',
      bucketName: this.bucketName,
    })
  }

  async createAndSaveW9TaxForm(taxForm: TaxFormEntity, date: number) {
    this.logger.log('TaxFormService => createAndSaveW9TaxForm => taxForm', JSON.stringify(taxForm))
    const { w9FormDetails } = await this.taxInfoService.getTaxInfoByVaultIdAndTokenAddress(taxForm.vaultId, taxForm.shareHolderRoleAddress)
    const { t1099FormDetails } = await this.taxInfoService.getTaxInfoByVaultIdAndTokenAddress(taxForm.vaultId)
    this.logger.log('TaxFormService => createAndSaveW9TaxForm => w9FormDetails', JSON.stringify(w9FormDetails))
    this.logger.log('TaxFormService => createAndSaveW9TaxForm => t1099FormDetails', JSON.stringify(t1099FormDetails))
    if (!w9FormDetails || !t1099FormDetails) return
    this.logger.log('TaxFormService => createAndSaveW9TaxForm => generateW9TaxFormPdf')
    const pdf = await this.taxFormGenerator.generateW9TaxFormPdf(w9FormDetails, t1099FormDetails, taxForm.securityCode!, date)
    this.logger.log('TaxFormService => createAndSaveW9TaxForm => generated')
    await this.s3ExternalStorage.uploadFile({
      s3Key: taxForm.s3Key,
      fileBody: pdf,
      contentType: 'application/pdf',
      bucketName: this.bucketName,
    })
  }

  async createAndSaveW8BenTaxForm(taxForm: TaxFormEntity, date: number) {
    this.logger.log('TaxFormService => createAndSaveW8BenTaxForm => taxForm', JSON.stringify(taxForm))
    const { w8BenFormDetails } = await this.taxInfoService.getTaxInfoByVaultIdAndTokenAddress(
      taxForm.vaultId,
      taxForm.shareHolderRoleAddress
    )
    this.logger.log('TaxFormService => createAndSaveW8BenTaxForm => w8BenFormDetails', JSON.stringify(w8BenFormDetails))
    if (!w8BenFormDetails) return
    this.logger.log('TaxFormService => createAndSaveW8BenTaxForm => generateW8BenTaxFormPdf')
    const pdf = await this.taxFormGenerator.generateW8BenTaxFormPdf(w8BenFormDetails, taxForm.securityCode!, date)
    this.logger.log('TaxFormService => createAndSaveW8BenTaxForm => generated')
    await this.s3ExternalStorage.uploadFile({
      s3Key: taxForm.s3Key,
      fileBody: pdf,
      contentType: 'application/pdf',
      bucketName: this.bucketName,
    })
  }

  async createAndSaveW8BenETaxForm(taxForm: TaxFormEntity, date: number) {
    this.logger.log('TaxFormService => createAndSaveW8BenETaxForm => taxForm', JSON.stringify(taxForm))
    const { w8BenEFormDetails } = await this.taxInfoService.getTaxInfoByVaultIdAndTokenAddress(
      taxForm.vaultId,
      taxForm.shareHolderRoleAddress
    )
    this.logger.log('TaxFormService => createAndSaveW8BenETaxForm => w8BenEFormDetails', JSON.stringify(w8BenEFormDetails))
    if (!w8BenEFormDetails) return
    this.logger.log('TaxFormService => createAndSaveW8BenETaxForm => generateW8BenETaxFormPdf')
    const pdf = await this.taxFormGenerator.generateW8BenETaxFormPdf(w8BenEFormDetails, taxForm.securityCode!, date)
    this.logger.log('TaxFormService => createAndSaveW8BenETaxForm => generated')
    await this.s3ExternalStorage.uploadFile({
      s3Key: taxForm.s3Key,
      fileBody: pdf,
      contentType: 'application/pdf',
      bucketName: this.bucketName,
    })
  }
}
