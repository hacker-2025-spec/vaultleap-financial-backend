import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HttpService } from '@nestjs/axios'
import { catchError, lastValueFrom } from 'rxjs'
import { DataMapper } from '@nova-odm/mapper'
import { LazyModuleLoader } from '@nestjs/core'

import { PersonaEntity } from './persona.entity'
import { PersonaReviewStatus } from './persona.types'
import { ConfigKeys, type IConfig } from '../config/config.interface'
import { PersonaApplicantResponseDTO, type PersonaApplicantDetailDTO, type PersonaInquiryIdResponseDTO } from './persona.dto'
import { SecretsManagerService } from '../secrets-manager/secrets-manager.service'
import { queryRecords } from '../utils/dynamoDbHelpers'

@Injectable()
export class PersonaService {
  constructor(
    private configService: ConfigService<IConfig, true>,
    private readonly httpService: HttpService,
    private lazyModuleLoader: LazyModuleLoader,
    private dataMapper: DataMapper
  ) {}

  private readonly logger = new Logger(PersonaService.name)

  async createInquiryId(auth0Id: string): Promise<PersonaInquiryIdResponseDTO> {
    try {
      this.logger.log('PersonaService -> createInquiryId -> auth0Id', auth0Id)

      const { SecretsManagerModule } = await import('../secrets-manager/secrets-manager.module')
      const moduleRef = await this.lazyModuleLoader.load(() => SecretsManagerModule, { logger: true })
      const secretsManagerService = moduleRef.get(SecretsManagerService)

      const personaApiToken = secretsManagerService.getPersonaApiToken()

      const inquiryTemplateId = this.configService.get(ConfigKeys.PERSONA_INQUIRY_TEMPLATE_ID, { infer: true })

      const config = {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${personaApiToken}`,
        },
        url: '/api/v1/inquiries',
        baseURL: 'https://api.withpersona.com',
        data: {
          data: {
            attributes: {
              'inquiry-template-id': inquiryTemplateId,
            },
          },
          meta: {
            'auto-create-account-reference-id': auth0Id,
          },
        },
      }

      const response = await lastValueFrom(
        this.httpService.request(config).pipe(
          catchError((error) => {
            console.error(error.response.data)
            throw new Error(error.response.data)
          })
        )
      )

      const inquiryId = response.data.data.id
      const accountId = response.data.data.relationships.account.data.id

      const databaseRecord = await this.getApplicantById(accountId)

      if (!databaseRecord) {
        const newApplicant = Object.assign(new PersonaEntity(), {
          id: accountId,
          auth0Id,
          applicantStatus: PersonaReviewStatus.PENDING,
        })

        await this.dataMapper.put(newApplicant)
      }

      return { inquiryId }
    } catch (error) {
      this.logger.error('PersonaService -> createInquiryId -> error', error)
      throw error
    }
  }

  private async getApplicantById(id: string) {
    try {
      const databaseRecord = await this.dataMapper.get(Object.assign(new PersonaEntity(), { id }))
      if (!databaseRecord) return null
      return databaseRecord
    } catch (error) {
      this.logger.log('PersonaService -> getApplicantById -> error', error)
      return null
    }
  }

  async updateApplicant(auth0Id: string, applicantDetails: PersonaApplicantDetailDTO): Promise<PersonaApplicantResponseDTO> {
    try {
      this.logger.log(`PersonaService -> updateApplicant -> auth0Id: ${auth0Id}`)
      this.logger.log(`PersonaService -> updateApplicant -> applicantDetails`, applicantDetails)

      const records = await queryRecords(this.dataMapper, { auth0Id }, { indexName: 'auth0IdIndex' }, PersonaEntity)
      const databaseRecord = records[0]

      if (!databaseRecord) {
        throw new Error('Applicant not found in local DB')
      }

      if (databaseRecord.applicantStatus !== PersonaReviewStatus.COMPLETED) {
        databaseRecord.applicantStatus = applicantDetails.applicantStatus
        await this.dataMapper.update(Object.assign(new PersonaEntity(), databaseRecord))
        return Object.assign(new PersonaApplicantResponseDTO(), databaseRecord)
      }
      return Object.assign(new PersonaApplicantResponseDTO(), databaseRecord)
    } catch (error) {
      this.logger.log('PersonaService -> updateApplicant -> error', error)
      throw error
    }
  }

  async checkUserKYCStatus(auth0Id: string): Promise<boolean> {
    try {
      const records = await queryRecords(this.dataMapper, { auth0Id }, { indexName: 'auth0IdIndex' }, PersonaEntity)

      // const records = await queryRecords(this.dataMapper, { auth0Id }, { indexName: 'auth0IdIndex' }, PersonaEntity)
      const databaseRecord = records[0]

      if (!databaseRecord) {
        this.logger.log('PersonaService -> checkUserKYCStatus -> KYC not found for auth0Id', auth0Id)
        return false
      }

      return databaseRecord.applicantStatus === PersonaReviewStatus.COMPLETED
    } catch (error) {
      this.logger.log('PersonaService -> checkUserKYCStatus', error.message)
      throw error
    }
  }
}
