import * as crypto from 'node:crypto'
import { catchError, lastValueFrom } from 'rxjs'

import { HttpService } from '@nestjs/axios'
import { DataMapper } from '@nova-odm/mapper'
import { LazyModuleLoader } from '@nestjs/core'
import { HttpException, Injectable } from '@nestjs/common'

import { SecretsManagerService } from '../secrets-manager/secrets-manager.service'

import { ReviewStatus } from './sum-sub.types'
import { SumSubEntity } from './sum-sub.entity'
import { SumSubApplicantResponseDTO } from './sum-sub.dto'
import type { SumSubApplicantDetailDTO, SumSubTokenResponseDTO } from './sum-sub.dto'
import { queryRecords } from '../utils/dynamoDbHelpers'

@Injectable()
export class SumSubService {
  constructor(
    private readonly httpService: HttpService,
    private lazyModuleLoader: LazyModuleLoader,
    protected dataMapper: DataMapper
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private createSignature(config: any, sumSubSecretKey: string) {
    const ts = Math.floor(Date.now() / 1000)
    const signature = crypto.createHmac('sha256', sumSubSecretKey)
    signature.update(ts + config.method.toUpperCase() + config.url)

    config.headers['X-App-Access-Ts'] = ts
    config.headers['X-App-Access-Sig'] = signature.digest('hex')

    return config
  }

  async requestToken(auth0Id: string): Promise<SumSubTokenResponseDTO> {
    try {
      const { SecretsManagerModule } = await import('../secrets-manager/secrets-manager.module')
      const moduleRef = await this.lazyModuleLoader.load(() => SecretsManagerModule, { logger: true })
      const secretsManagerService = moduleRef.get(SecretsManagerService)

      const sumSubAppToken = secretsManagerService.getSumsubApiAppToken()
      const sumSubSecretKey = secretsManagerService.getSumsubApiSecretKey()

      const levelName = 'basic-kyc-level'
      const ttlInSecs = 600

      const config = {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'X-App-Token': sumSubAppToken,
        },
        url: `/resources/accessTokens?userId=${encodeURIComponent(`${auth0Id}`)}&ttlInSecs=${ttlInSecs}&levelName=${levelName}`,
        baseURL: 'https://api.sumsub.com',
      }

      this.httpService.axiosRef.interceptors.request.use(this.createSignature(config, sumSubSecretKey), function (error) {
        return Promise.reject(error)
      })

      const response = await lastValueFrom(
        this.httpService.request(config).pipe(
          catchError((error) => {
            console.error(error.response.data)
            throw new Error(error.response.data)
          })
        )
      )

      return { token: response.data.token, userId: response.data.userId }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new HttpException(error.response.data.message, error.response.data.statusCode, { cause: error })
    }
  }

  async addApplicant(auth0Id: string, applicantDetails: SumSubApplicantDetailDTO): Promise<SumSubApplicantResponseDTO> {
    try {
      const isApplicantExist = await this.dataMapper
        .get(Object.assign(new SumSubEntity(), { id: applicantDetails.applicantId }))
        .catch(() => false)

      if (isApplicantExist) {
        const databaseRecord = await this.dataMapper.get(Object.assign(new SumSubEntity(), { id: applicantDetails.applicantId }))
        if (databaseRecord.applicantStatus !== ReviewStatus.COMPLETED) {
          databaseRecord.applicantStatus = applicantDetails.applicantStatus
          await this.dataMapper.update(Object.assign(new SumSubEntity(), databaseRecord))
          return Object.assign(new SumSubApplicantResponseDTO(), databaseRecord)
        }
        return Object.assign(new SumSubApplicantResponseDTO(), databaseRecord)
      }

      const newApplicant = Object.assign(new SumSubEntity(), {
        id: applicantDetails.applicantId,
        auth0Id,
        applicantStatus: applicantDetails.applicantStatus,
      })
      const databaseRecord = await this.dataMapper.put(newApplicant)
      return Object.assign(new SumSubApplicantResponseDTO(), databaseRecord)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new Error(error)
    }
  }

  async checkUserKYCStatus(auth0Id: string): Promise<boolean> {
    try {
      const records = await queryRecords(this.dataMapper, { auth0Id }, { indexName: 'auth0IdIndex' }, SumSubEntity)

      if (records.length === 0) {
        return false
      }

      return records[0].applicantStatus === ReviewStatus.COMPLETED
    } catch {
      return false
    }
  }
}
